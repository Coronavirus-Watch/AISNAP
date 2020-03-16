// This is designed to download and eventually update the coronavirus dataset
// Eventually this would be run by the server periodically as the WHO updates the dataset

// Data source: https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports

// Loads NodeJS Modules
const axios = require('axios');
const fs = require('fs');
const rimraf = require('rimraf');
const schedule = require('node-schedule');
const express = require('express');
const port = process.env.PORT || 3000;
// Classes
const Timeline = require('./components/Timeline');

const app = express();

app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));

// Link to source data
const source =
	'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports';

// Temporary path to store the downloaded data
const tempPath = './data/tmp';

// Path to store the parsed and exported JSON
const exportPath = './data/';

// Stores data for a Day
const Day = require('./components/Day');

// Updates and formats coronavirus dataset every day at 01:00
let scheduler = schedule.scheduleJob('* 1 * * *', function(date) {
	sync(date);
});
sync(new Date());

const timeline = new Timeline();

// API Endpoint for certain Day in Timeline
app.get('/day/:day', async (req, res) => {
	// console.log(await timeline.retrieveDay(req.params.day));
	res.send(await timeline.retrieveDay(req.params.day));
});

// API Endpoint for range in Timeline
app.get('/range', (req, res) => {
	// console.log(await timeline.retrieveDay(req.params.day));
	res.send({ range: timeline.days.length });
});

// Updates and formats coronavirus dataset
async function sync(date) {
	console.log('syncing', date);
	// downloads files from source
	let files = await download();
	// parses downloaded files into JSON
	const days = await timeline.init(files);
	// exports parsed data to json file
	console.log(days.length);
	// console.log('exporting to json with days[0]', days[0]);
	exportJson(days, exportPath, 'timeline.json');
	// exports parsed data to csv file
	console.log('exporting to csv');
	exportCsv(days, exportPath, 'timeline.csv');
	// exports parsed data to countries csv file
	console.log('exporting to countries csv');
	exportCountryCsv(days, exportPath, 'countries.csv');
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
		// console.log(data);
	}
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
	console.log('exported to json');
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

// exports CSV to exportPath given
function exportCountryCsv(days, exportPath, extension) {
	// intiailises CSV string
	let output = '';
	// Loops through each day, appending to the output variable
	for (let i = 0; i < days.length; i++) {
		for (let j = 0; j < days[i].countries.length; j++) {
			output +=
				days[i].countries[j].name +
				',' +
				days[i].countries[j].population +
				',' +
				days[i].countries[j].continent +
				'\n';
		}
	}

	// Creating a file descriptor to open the file for writing
	const fd = fs.openSync(exportPath + extension, 'w');

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

