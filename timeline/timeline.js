// This is designed to download and eventually update the coronavirus dataset
// Eventually this would be run by the server periodically as the WHO updates the dataset

// Data source: https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports

// Loads NodeJS Modules
const fs = require('fs');
const http = require('http');
const request = require('request');
const tempPath = '../data/tmp';
// Link to source data
const source =
	'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports';

// Stores data for a day by country
class Day {
	constructor() {
		this.countries = [];
	}

	addData(cases, deaths, recovered, countryName, day) {
		this.day = day;
		if (countries.includes(countryName)) {
			countries[countryName].additionalData(cases, deaths, recovered);
		} else {
			countries[countryName] = new Country(
				cases,
				deaths,
				recovered,
				countryName
			);
		}
	}

	print() {
		console.log('Day: ' + this.day);
		countries.forEach(element => {
			element.print();
		});
	}
}

// Stores country for a single day
class Country {
	constructor(cases = 0, deaths = 0, recovered = 0, name) {
		this.cases = cases;
		this.deaths = deaths;
		this.recovered = recovered;
		this.name = name;
	}

	additionalData(cases = 0, deaths = 0, recovered = 0) {
		this.cases = this.cases + cases;
		this.deaths = this.deaths + deaths;
		this.recovered = this.recovered + recovered;
	}

	print() {
		console.log(
			'\t' + 'Cases: ' + this.cases + '\t' + 'Deaths: ' + this.deaths,
			'Recovered: ' + this.recovered
		);
	}
}

// NodeJS - Allows you to connect using http://localhost:8080
http.createServer(function(req, res) {
	// Updates and formats coronavirus dataset
	sync();
}).listen(8080);

// Updates and formats coronavirus dataset
function sync() {
	// Make directory for source files if doesn't already exist
	if (!fs.existsSync(tempPath)) {
		fs.mkdirSync(tempPath);
	}
	// // Identifies and downloads source files
	// download();
	// Create temporary file to store export

	// Identify common countries and store each as an object, add each cell (confirmed, death, recovered) together
	objectification();

	// ^ This is enough to process one day's data

	// // Deletes temporary files
	// if (fs.existsSync(tempPath)) {
	//     rimraf.sync(tempPath);
	// }
}

// Identifies source files to download
function download() {
	// Sets the first file to look at
	var date = new Date('2020-01-22');
	const today = new Date();
	// Runs though all the files
	while (date < today) {
		// Returns the date formatted as used in the url for files
		var formatted = getDateFormatted(date);
		// Downloads the file
		downloadFile(
			source + '/' + formatted + '.csv',
			tempPath + '/' + formatted + '.csv',
			onDownloadFileDone
		);
		// Sets next day
		date.setDate(date.getDate() + 1);
	}
}
const tempPath = '../data/tmp';
const source =
	'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/';

http.createServer(function(req, res) {
	// Make directory for source files if doesn't already exist
	if (!fs.existsSync(tempPath)) {
		console.log('here');
		fs.mkdirSync(tempPath);
	} else {
		console.log('there');
	}
	// Identifies and downloads source files
	download();

	// Create temporary file to store export
	// Identify common countries and store each as an object, add each cell (confirmed, death, recovered) together
	// Utilise country dictionary to sort through problematic names
	// ^ This is enough to process one day's data
	// Cleanup
	console.log('test');
}).listen(8080);

function objectification() {
	var days = [];
	cb = onDownloadFileDone;
	// Credits: https://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
	fs.readdir(tempPath, function(err, filenames) {
		if (err) {
			cb(err);
			return;
		}
		filenames.forEach(function(filename) {
			fs.readFile(tempPath + '/' + filename, 'utf-8', function(
				err,
				content
			) {
				if (err) {
					cb(err);
					return;
				}
				days[filename] = processTempFile(filename, content);
			});
		});
	});
	return days;
}

function processTempFile(filename, content) {
	var day = new Day();
	// Seperating each lines
	const lines = content.split('\n');
	// Loops through each line
	for (let i = 0; i < lines.length; i++) {
		// Extracts each line
		const regionLine = lines[i].split(',');
		const countryName = dictionary(regionLine[1].trim());
		day.addData(
			countryName,
			regionLine[3].trim(),
			regionLine[4].trim(),
			regionLine[5].trim()
		);
		day.print();

		// if (countries.includes(countryName)) {
		//     // Adds the region's statistics to the country total
		//     countries[countryName] = {
		//         cases: countries[countryName].cases + countryLine[3].trim(),
		//         deaths: countries[countryName].deaths + countryLine[4].trim(),
		//         recovered: countries[countryName].recovered + countryLine[5].trim()
		//     }
		// }
		// else {
		//     // Adds the country as a new item
		//     countries[countryName] = {
		//         cases: countryLine[3].trim(),
		//         deaths: countryLine[4].trim(),
		//         recovered: countryLine[5].trim()
		//     };
		// }
	}
	return day;
}

// Returns the date formatted as used in the url for files
function getDateFormatted(date) {
	var day = ('0' + String(date.getDate())).slice(-2);
	var month = ('0' + String(date.getMonth() + 1)).slice(-2);
	var year = String(date.getFullYear());
	var dateVar = month + '-' + day + '-' + year;
	return dateVar;

	// Credits: https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
	function downloadFile(url, dest, cb) {
		console.log('URL: ' + url + '\t' + 'Destination: ' + dest);
		const file = fs.createWriteStream(dest);
		const sendReq = request.get(url);

		// verify response code
		sendReq.on('response', response => {
			if (response.statusCode !== 200) {
				fs.unlink(dest, cb);
				return cb('Response status was ' + response.statusCode);
			}
			sendReq.pipe(file);
		});

		// close() is async, call cb after close completes
		file.on('finish', () => file.close(cb));
		// check for request errors
		sendReq.on('err', err => {
			fs.unlink(dest, cb);
			return cb(err.message);
		});

		// Handle errors
		file.on('err', err => {
			// Delete the file async. (But we don't check the result)
			fs.unlink(dest, cb);
			return cb(err.message);
		});
	}
}
