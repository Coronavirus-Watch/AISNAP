// This is designed to download and eventually update the coronavirus dataset
// Eventually this would be run by the server periodically as the WHO updates the dataset

// Data source: https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports

// Loads NodeJS Modules
const axios = require('axios');
const fs = require('fs');
const schedule = require('node-schedule');
const express = require('express');

// Requiring and Initialising Timeline Class
const Timeline = require('./components/Timeline');
const timeline = new Timeline();

// Setting up Express Server
const app = express();
app.listen(3000, () => console.log('App is running'));
app.use(express.static('public'));

// Link to source data
const source =
	'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports';

// Temporary path to store the downloaded data
const tempPath = `${__dirname}/data/tmp`;

// Path to store the parsed and exported JSON
const exportPath = `${__dirname}/data/`;

// Stores data for a Day
const Day = require('./components/Day');

// Updates and formats coronavirus dataset every day at 01:00
let scheduler = schedule.scheduleJob('* 1 * * *', function(date) {
	sync(date);
});

// Runs initial Sync
sync(new Date());

// API Endpoint for certain Day in Timeline
app.get('/day/:day', async (req, res) =>
	res.send(await timeline.retrieveDay(req.params.day))
);

// API Endpoint for range in Timeline
app.get('/range', (req, res) => res.send({ range: timeline.days.length }));

// API Eendpoint for country statistics
app.get('/country/:country', (req, res) => {
	let countryTimeline = [];
	timeline.days.forEach(day => {
		let exists = day.countries.findIndex(country => {
			if (
				country.name.toLowerCase() === req.params.country.toLowerCase()
			) {
				return country;
			}

			let altSpellings = [];
			for (let i = 0; i < country.altSpellings.length; i++) {
				if (
					country.altSpellings[i].toLowerCase() ===
					req.params.country.toLowerCase()
				) {
					altSpellings.push(i);
				}
			}
			if (altSpellings.length > 0) {
				return country;
			}
		});

		if (exists > -1) {
			countryTimeline.push([day.countries[exists], day.date]);
		}
	});
	res.send({ timeline: countryTimeline, search: req.params.country });
});

app.get('/alldays', (req, res) => {
	res.send({theTimeline: timeline.days});
});

// Updates and formats coronavirus dataset
async function sync(date) {
	console.log('syncing', date);

	// downloads files from source
	let files = await download();

	// parses downloaded files into JSON

	const days = await timeline.init(files);

	// exports parsed data to json file
	exportJson(days, exportPath, 'timeline.json');

	// exports parsed data to csv file
	exportCsv(days, exportPath, 'timeline.csv');

	// exports parsed data to countries csv file
	// exportCountryCsv(days, exportPath, 'countries.csv');
	return await days;
}

// Downloads files from source and returns a data structure containing
// all files' content
async function download() {
	// initialises files data structure
	let files = [];

	// Sets the first file to look at
	let date = new Date('2020-01-22');

	// Calculates millisecond date for today to compare against other dates
	let today = new Date();
	today.setHours(0, 0, 0, 0);

	// Runs though all the files until Today
	while (date.valueOf() < today.valueOf()) {
		// Returns the date formatted as used in the url for files
		const formatted = getDownloadDate(date);
		const filePath = source + '/' + formatted + '.csv';

		// Downloads the file content
		const fileData = await requestFile(filePath);

		// Pushes content and path to data structure
		files.push([formatted, fileData]);

		// Increments to next day
		date.setDate(date.getDate() + 1);
	}

	// returns resulting file data structure
	return files;
}

// requests file content using link parameter
async function requestFile(path) {
	// Sends an HTTP request to "path" and returns text content
	let fileContents = await axios({
		url: path,
		responseType: 'blob',
		method: 'get'
	})
		.then(response => response.data)
		.catch(err => console.error(error));

	// returns data fetched from source
	return fileContents;
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
	console.log(`Exported to ${exportPath}${extension}`);
}

// exports CSV to exportPath given
function exportCsv(days, exportPath, extension) {
	// intiailises CSV string
	let output = '';

	// Loops through each day, appending to the output variable
	days.forEach(day => {
		day.countries.forEach(country => {
			output += `${country.name},${country.cases},${country.deaths},${country.recovered},${country.population},${country.continent},${day.date}\n`;
		});
	});

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
	console.log(`Exported to ${exportPath}${extension}`);
}

// exports CSV to exportPath given
function exportCountryCsv(days, exportPath, extension) {
	// intiailises CSV string
	const { countries } = days[days.length - 1];

	// creates output string with formatted attributes
	const output =
		countries.name +
		',' +
		countries.population +
		',' +
		countries.continent +
		'\n';

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
	console.log(`Exported to ${exportPath}${extension}`);
}

// Returns the date formatted as used in the url for files
function getDownloadDate(date) {
	const day = ('0' + date.getDate()).slice(-2);
	const month = ('0' + (date.getMonth() + 1)).slice(-2);
	const year = date.getFullYear();
	const dateVar = month + '-' + day + '-' + year;
	return dateVar;
}
