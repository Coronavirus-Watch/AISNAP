// This is designed to download and eventually update the coronavirus dataset
// Eventually this would be run by the server periodically as the WHO updates the dataset

// Data source: https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports

// Loads NodeJS Modules
const axios = require('axios');
const fs = require('fs');
const rimraf = require('rimraf');
const schedule = require('node-schedule');

// Link to source data
const source =
	'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports';

// Temporary path to store the downloaded data
const tempPath = '../data/tmp';

// Path to store the parsed and exported JSON
const exportPath = '../data/timeline';

// Stores data for a Day
const Day = require('./Day');

// Updates and formats coronavirus dataset
sync();

// Updates and formats coronavirus dataset
async function sync() {
	// downloads files from source
	let files = await download();
	// parses downloaded files into JSON
	let days = await parseDownload(files);
	// exports parsed data to json file
	exportJson(days, exportPath, '.json');
	// exports parsed data to csv file
	exportCsv(days, exportPath, '.csv');
}

// Downloads files from source and returns a data structure containing
// all files' content
async function download() {
	// initialises files data structure
	let files = [];

	// Sets the first file to look at
	let date = new Date('2020-01-22');

	// Calculates millisecond date for today to compare against other dates
	const todayDate = new Date();
	const today = new Date(
		todayDate.getFullYear(),
		todayDate.getMonth(),
		todayDate.getDate()
	);

	// Runs though all the files until Today
	while (date.valueOf() < today.valueOf()) {
		// Returns the date formatted as used in the url for files
		const formatted = getDownloadDate(date);

		// Downloads the file content
		const fileData = await requestFile(
			source + '/' + formatted + '.csv',
			onDownloadFileDone
		);
		// Pushes content and path to data structure
		files.push([formatted, fileData]);

		// Increments to next day
		date.setDate(date.getDate() + 1);
	}

	// returns resulting file data structure
	return files;
}

// requests file content using link parameter
async function requestFile(link, cb) {
	// Sends an HTTP request to "link" and returns text content
	let fileContents = await axios({
		url: link,
		responseType: 'blob',
		method: 'get'
	})
		.then(response => {
			// returns response text to fileContents variable
			return response.data;
		})
		.catch(err => {
			// Callback for handling error
			return cb(err.message);
		});

	// returns data fetched from source
	return fileContents;
}

// Prints download messages
function onDownloadFileDone(data) {
	if (data) {
		console.log(data);
	}
}

// parses the downloaded files into an Array format
async function parseDownload(files) {
	// creates an array to store all parsed data for each day contained in the files
	let days = [];
	// stores the previous day we've processed used to smooth out days without information
	let previousDay = new Day();

	// Loops through each file, creating a new Day instance and extra data parsing
	files.forEach(async function(day) {
		const process = await processDay(day[0], day[1]);
		// await checkConcurrency(process, previousDay);
		days.push(process);
		previousDay = process;
	});

	// returning the resulting days array
	return days;
}

// Process a file representing the coronavirus statistics by country for that day
function processDay(filename, content) {
	let day = new Day();
	// Prevents commas within quotes from messing up the seperation
	content = dealsWithQuoteMarks(content);
	// Seperating each lines
	const lines = content.split('\n');
	// Loops through each line
	for (let i = 1; i < lines.length; i++) {
		// Extracts each line
		const regionLine = lines[i].split(',', -1);
		// Makes any elements that are blank 0
		for (let index = 1; index < regionLine.length; index++) {
			if (!regionLine[index] || regionLine[index].includes('\r')) {
				regionLine[index] = '0';
			}
		}
		// Prevents an error with undefined fields
		if (typeof regionLine[1] !== 'undefined') {
			// Extracts constants from the region line
			const cases = regionLine[3].trim();
			const deaths = regionLine[4].trim();
			const recovered = regionLine[5].trim();
			const countryName = dictionary(regionLine[1].trim());
			const date = getFormattedDate(filename);
			// Checks if the entry is blank
			if (cases > 0) {
				day.addData(cases, deaths, recovered, countryName, date);
			}
		}
	}
	return day;
}

// Checks if a country is present in a previous day but not the current day
// And adds it to the current day if not
async function checkConcurrency(day, previousDay) {
	previousDay.countries.forEach(async function(country) {
		if (day.searchForCountry(country.name) === -1) {
			day.addData(
				country.cases,
				country.deaths,
				country.recovered,
				country.name
			);
		}
	});
}

// Prevents commas within quotes in a csv file from messing up the seperation
function dealsWithQuoteMarks(content) {
	let inQuote = false;
	for (let index = 0; index < content.length; index++) {
		let element = content.charAt(index);
		if (inQuote && element === ',') {
			// Deletes element
			content =
				content.slice(0, index - 1) +
				content.slice(index, content.length);
		} else if (element === '"') {
			// Deletes element
			content =
				content.slice(0, index - 1) +
				content.slice(index, content.length);
			if (inQuote) {
				inQuote = false;
			} else {
				inQuote = true;
			}
		}
	}
	return content;
}

// exports JSON to exportPath given
function exportJson(days, exportPath, extension) {
	// intiailises JSON data structure
	let json = [];
	// Loops through each day, appending to the JSON object
	days.forEach(element => {
		json[json.length] = JSON.stringify(element);
	});

	// Creating a file descriptor to open the file for writing
	const fd = fs.openSync(exportPath + extension, 'w+');

	// writes entire JSON to file
	fs.writeFile(exportPath + extension, JSON.stringify(days, null, 4), err => {
		if (err) {
			console.log(err);
		}
	});

	// closes file using file descriptor value
	fs.closeSync(fd);
}

// exports CSV to exportPath given
function exportCsv(days, exportPath, extension) {
	// intiailises CSV string
	let output = '';
	// Loops through each day, appending to the output variable
	for (let i = 0; i < days.length; i++) {
		for (let j = 0; j < days[i].countries.length; j++) {
			output +=
				days[i].countries[j].name +
				',' +
				days[i].countries[j].cases +
				',' +
				days[i].countries[j].deaths +
				',' +
				days[i].countries[j].recovered +
				',' +
				days[i].day +
				'\n';
		}
	}

	// Creating a file descriptor to open the file for writing
	const fd = fs.openSync(exportPath + extension, 'w+');

	// writes entire JSON to file
	fs.writeFile(exportPath + extension, output, err => {
		if (err) {
			console.log(err);
		}
	});

	// closes file using file descriptor value
	fs.closeSync(fd);
}

// Returns the date formatted as used in the url for files
function getDownloadDate(date) {
	const day = ('0' + String(date.getDate())).slice(-2);
	const month = ('0' + String(date.getMonth() + 1)).slice(-2);
	const year = String(date.getFullYear());
	const dateVar = month + '-' + day + '-' + year;
	return dateVar;
}

// calculates formatted date using the downloaded filename
// returns formatted date
function getFormattedDate(downloadDate) {
	// Removes extension if necessary
	if (downloadDate.endsWith('.csv')) {
		downloadDate.replace('.csv', '');
	}
	// parses all date sections
	const sections = downloadDate.split('-');
	const day = sections[1];
	const month = sections[0];
	const year = sections[2];
	const dateVar = day + '/' + month + '/' + year;

	// returns formatted date
	return dateVar;
}

// Changes country names to match other parts of the database
function dictionary(countryName) {
	switch (countryName) {
		case 'Mainland China':
			return 'China';
		case 'US':
			return 'United States';
		case 'UK':
			return 'United Kingdom';
		case 'Saint Barthelemy':
			return 'France';
		case 'occupied Palestinian territory':
		case 'Palestine':
			return 'Palestinian Territories';
		case 'North Macedonia':
			return 'Macedonia [FYROM]';
		case 'Iran (Islamic Republic of)':
			return 'Iran';
		case 'Hong Kong SAR':
			return 'Hong Kong';
		case 'Viet Nam':
			return 'Vietnam'
		case 'Macao SAR':
			return 'Macau';
		case 'Russian Federation':
			return 'Russia';
		case 'Ivory Coast':
		case 'Cote d\'Ivoire':
			return "Côte dIvoire";
		case 'Taiwan*':
			return 'Taiwan';
		case 'North Ireland':
			return 'United Kingdom';
		case 'Republic of Ireland':
			return 'Ireland'
		case 'Holy See':
			return 'Vatican City'
		case 'Czechia':
			return 'Czech Republic'		
		case 'Reunion':
			return 'France';
		case 'Republic of Korea':
		case 'Sout\"':
			return 'South Korea';
		case 'St. Martin':
		case 'Saint Martin':
			return 'France';
		case 'Republic of Moldova':
			return 'Moldova';
		case 'Taipei and environs':
			return 'Taiwan';
		case 'Channel Islands':
			return 'United Kingdom';
		case 'Congo (Kinshasa)':
			return 'Congo [DRC]';
		case 'Cruise Ship':
		case 'Others':
			return 'Japan';
		default:
			return countryName;
	}
}
