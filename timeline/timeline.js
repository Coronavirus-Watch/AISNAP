// This is designed to download and eventually update the coronavirus dataset
// Eventually this would be run by the server periodically as the WHO updates the dataset

// Data source: https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports

// Loads NodeJS Modules
// const csv = require('csv');
const axios = require('axios');
const fs = require('fs');
const http = require('http');
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

    print() {
        console.log("\t\t" + "Country: " + this.name + "\t" + "Cases: " + this.cases + "\t" + "Deaths: " + this.deaths + "\t", "Recovered: " + this.recovered);
    }
}

// Updates and formats coronavirus dataset
sync();

// Updates and formats coronavirus dataset
async function sync() {
    // Make directory for source files if doesn't already exist
    if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath);
    }
    // // Identifies and downloads source files
    // download().then(objectification()).then(days => {
    //     console.log(days);
    //     exportJson(days, exportPath)}
    // ).catch(err => {
    //     console.log('fucking shit', err);
    // });
    // download().then(res => {
    //     console.log("This is the result ?= ", res);
    // }).then((days) => {
    //     console.log(days);
    //     
    // }).catch(err => {
    //     console.log(err);
    // });
    // // Identify common countries and store each as an object, add each cell (confirmed, death, recovered) together
    // let days = await ;
    // // 
    download();
    let days = await objectification(true);
    // console.log(days);
    exportJson(days, exportPath);
    
    // Export class to json
    // // Deletes temporary files
    // if (fs.existsSync(tempPath)) {
    //     rimraf.sync(tempPath);
    // }s
}

// Identifies source files to download
function download() {
    // Sets the first file to look at
    let date = new Date("2020-01-22");
    const todayDate = new Date();
    const today = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    // console.log(date.valueOf(), today.valueOf());

    // Runs though all the files
    while (date.valueOf() < today.valueOf()) {
        // Returns the date formatted as used in the url for files
        const formatted = getDownloadDate(date);

        // Downloads the file
        requestFile(source + "/" + formatted + ".csv", tempPath + "/" + formatted + ".csv", onDownloadFileDone);
        // Sets next day
        date.setDate(date.getDate() + 1);
    }
}

// Credits: https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
function requestFile(link, dest, cb) {
    // console.log('URL: ' + link + '\t' + 'Destination: ' + dest);
    const file = fs.createWriteStream(dest);
    axios({ url: link, responseType: 'blob', method: 'get' }).then(response => {
        fs.writeFile(dest, response.data, (err) => {
            if (err) {
                throw new Error();
            }
        });
    }).catch(err => {
        return cb(err.message);
    });

    return "This is the best";
}

// Prints download messages
function onDownloadFileDone(data) {
    if (data) {
        console.log(data);
    }
}

// 
function objectification(done) {
    if (!done) {
        console.log("shit");
        return;
    }
    let days = [];
    const filenames = fs.readdirSync(tempPath);
    filenames.forEach(filename => {
        const data = fs.readFileSync(tempPath + "/" + filename, 'utf8')
        days.push(processTempFile(filename, data));
    });
    return days;
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

// 
function exportJson(days, exportPath) {
    let json = [];
    days.forEach(element => {
        json[json.length] = JSON.stringify(element);
    });
    fs.writeFile(exportPath, JSON.stringify(days, null, 4), 'utf8', function (err) {
        if (err) throw err;
    });
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