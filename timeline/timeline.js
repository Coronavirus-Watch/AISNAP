// This is designed to download and eventually update the coronavirus dataset
// Eventually this would be run by the server periodically as the WHO updates the dataset

// Data source: https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports

// Loads NodeJS Modules
// const csv = require('csv');
const fs = require('fs');
const http = require('http');
const request = require('request');
const rimraf = require('rimraf');
const schedule = require('node-schedule');

// Link to source data
const source = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports";
//
const tempPath = "../data/tmp";
//
const exportPath = "../data/timeline.json";

// Stores data for a day by country
class Day {
    constructor() {
        // Stores each individual country
        this.countries = new Array();
    }

    // Adds data from a region
    addData(cases, deaths, recovered, countryName, day) {
        this.day = day;
        let index = this.searchForCountry(countryName);
        // Checks if a country is on the array
        if (this.searchForCountry(countryName) != -1) {
            this.countries[index].additionalData(cases, deaths, recovered);
            // console.log("Country detected");
        }
        else {
            this.countries[this.countries.length] = new Country(cases, deaths, recovered, countryName);
            // console.log("New country added");
        }
    }

    // Checks if a country is on the array
    searchForCountry(countryName) {
        for (let i = 0; i < this.countries.length; i++) {
            const element = this.countries[i];
            if (element.name === countryName) {
                return i;
            }
        }
        return -1;
    }

    // outputJson() {
    //     let json;
    //     this.countries.forEach(element => {
    //         console.log(JSON.stringify(element.getJson()));
    //     });
    //     return json;
    // }

    // Prints all data stored
    print() {
        console.log("Day: " + this.day);
        this.countries.forEach(element => {
            // console.log("Country?");
            element.print();
        });
    }
}

// Stores country for a single day
class Country {
    constructor(cases = "0", deaths = "0", recovered = "0", name) {
        this.cases = parseInt(cases);
        this.deaths = parseInt(deaths);
        this.recovered = parseInt(recovered);
        this.name = name;
    }

    additionalData(cases = "0", deaths = "0", recovered = "0") {
        this.cases = this.cases + parseInt(cases);
        this.deaths = this.deaths + parseInt(deaths);
        this.recovered = this.recovered + parseInt(recovered);
    }

    // getJson() {
    //     let countryObj = {
    //         name: this.name,
    //         cases: this.cases,
    //         deaths: this.deaths,
    //         recovered: this.recovered
    //     }
    //     return countryObj;
    // }

    print() {
        console.log("\t\t" + "Country: " + this.name + "\t" + "Cases: " + this.cases + "\t" + "Deaths: " + this.deaths + "\t", "Recovered: " + this.recovered);
    }
}

// NodeJS - Allows you to connect using http://localhost:8080
// http.createServer(function (req, res) {
// Updates and formats coronavirus dataset
sync();
// }).listen(8080);

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
    let days = objectification();
    // 
    // console.log(days);
    // // Export class to json
    // exportJson(days, exportPath);

    // // Deletes temporary files
    // if (fs.existsSync(tempPath)) {
    //     rimraf.sync(tempPath);
    // }
}

// Identifies source files to download
function download() {
    // Sets the first file to look at
    let date = new Date("2020-01-22");
    const today = new Date();
    // Runs though all the files
    while (date < today) {
        // Returns the date formatted as used in the url for files
        const formatted = getDownloadDate(date);
        // Downloads the file
        downloadFile(source + "/" + formatted + ".csv", tempPath + "/" + formatted + ".csv", onDownloadFileDone);
        // Sets next day
        date.setDate(date.getDate() + 1);
    }
}
const tempPath = '../data/tmp';
const source =
	'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/';

// 
function objectification() {
    let days = [];
    cb = onDownloadFileDone;
    // Credits: https://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
    fs.readdir(tempPath, function (err, filenames) {
        if (err) {
            cb(err);
            return;
        }
        filenames.forEach( function (filename) {
            fs.readFile(tempPath + "/" + filename, 'utf-8', function (err, content) {
                if (err) {
                    cb(err);
                    return;
                }
                // Process a file representing the coronavirus statistics by country for that day
                const day = processTempFile(filename, content, onTempFile);
                days[days.length] = day; 
            });
        });
    });

    // Waits until the above functions are done
    setTimeout(function () {
        return days;
    }, 100);
}

// 
function exportJson(days, exportPath) {
    let json = [];
    days.forEach(element => {
        // json[json.length] = element.getJson();
        // console.log(element);
    });
    try {
        fs.writeFileSync(exportPath, json);
    } catch (error) {
        console.error(err);
    }
}

// Process a file representing the coronavirus statistics by country for that day
function processTempFile(filename, content) {
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
                regionLine[index] = "0";
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
            // Adds constants to the day object
            day.addData(cases, deaths, recovered, countryName, date);
        }
    }
    // // Prints the stored data in the day we've produced
    // day.print
    return day;
}

// Prevents commas within quotes in a csv file from messing up the seperation
function dealsWithQuoteMarks(content) {
    let inQuote = false;
    for (let index = 0; index < content.length; index++) {
        let element = content.charAt(index);
        if (inQuote && element === ",") {
            // Deletes element
            content = content.slice(0, index - 1) + content.slice(index, content.length);
        }
        else if (element === "\"") {
            // Deletes element
            content = content.slice(0, index - 1) + content.slice(index, content.length);
            if (inQuote) {
                inQuote = false;
            }
            else {
                inQuote = true;
            }
        }
    }
    return content;
}

// Returns the date formatted as used in the url for files
function getDownloadDate(date) {
    const day = ("0" + String(date.getDate())).slice(-2);
    const month = ("0" + String(date.getMonth() + 1)).slice(-2);
    const year = String(date.getFullYear());
    const dateVar = month + "-" + day + "-" + year;
    return dateVar;
}

function getFormattedDate(downloadDate) {
    // Removes extension if necessary
    if (downloadDate.endsWith(".csv")) {
        downloadDate.replace(".csv", "");
    }
    const sections = downloadDate.split("-");
    const day = sections[1];
    const month = sections[0];
    const year = sections[2];
    const dateVar = day + "/" + month + "/" + year;
    return dateVar;
}

// Credits: https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
function download(url, dest, cb) {
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

// Prints download messages
function onDownloadFileDone(data) {
    if (data) {
        console.log(data);
    }
}

// Changes country names to match other parts of the database
function dictionary(countryName) {
    switch (countryName) {
        case "Mainland China":
            return "China";
        case "US":
            return "United States";
        case "UK":
            return "United Kingdom";
        case "Saint Barthelemy":
            return "France";
        default:
            return countryName;
    }
}