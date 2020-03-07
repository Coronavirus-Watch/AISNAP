// This is designed to download and eventually update the coronavirus dataset
// Eventually this would be run by the server periodically as the WHO updates the dataset

// Data source: https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports

const fs = require('fs');
const http = require('http');
const request = require('request');
const rimraf = require('rimraf');
const tempPath = "../data/tmp";
const source = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports";

// NodeJS - Allows you to connect using http://localhost:8080
http.createServer(function (req, res) {
    // Updates and formats coronavirus dataset
    sync();
}).listen(8080); 

// Updates and formats coronavirus dataset
function sync() {
    // Make directory for source files if doesn't already exist
    if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath);
    }
    // Identifies and downloads source files
    download();

    // Create temporary file to store export
    // Identify common countries and store each as an object, add each cell (confirmed, death, recovered) together
    // Utilise country dictionary to sort through problematic names
    // ^ This is enough to process one day's data

    // // Deletes temporary files
    // if (fs.existsSync(tempPath)) {
    //     rimraf.sync(tempPath);
    // }
}

// Identifies source files to download
function download() {
    // Sets the first file to look at
    var date = new Date("2020-01-22");
    const today = new Date();
    // Runs though all the files
    while (date < today) {
        // Returns the date formatted as used in the url for files
        var formatted = getDateFormatted(date);
        // Downloads the file
        downloadFile(source + "/" + formatted + ".csv", tempPath + "/" + formatted + ".csv", onDownloadFileDone);
        // Sets next day
        date.setDate(date.getDate() + 1);
    }
}

// Returns the date formatted as used in the url for files
function getDateFormatted(date) {
    var day = ("0" + String(date.getDate())).slice(-2);
    var month = ("0" + String(date.getMonth() + 1)).slice(-2);
    var year = String(date.getFullYear());
    var dateVar = month + "-" + day + "-" + year;
    return dateVar;
}

// Credits: https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
function downloadFile(url, dest, cb) {
    console.log("URL: " + url + "\t" + "Destination: " + dest);

    const file = fs.createWriteStream(dest);
    const sendReq = request.get(url);
    // const sendReq = request(url, { json: true }, (err, res, body) => {
    //     if (err) {
    //         return console.log(err);
    //     }
    //     console.log(body.url);
    //     console.log(body.explanation);
    // });

    // verify response code
    sendReq.on('response', (response) => {
        if (response.statusCode !== 200) {
            fs.unlink(dest, cb);
            return cb('Response status was ' + response.statusCode);
        }
        sendReq.pipe(file);
    });

    // close() is async, call cb after close completes
    file.on('finish', () => file.close(cb));

    // check for request errors
    sendReq.on('err', (err) => {
        fs.unlink(dest, cb);
        return cb(err.message);
    });

    // Handle errors
    file.on('err', (err) => { 
        // Delete the file async. (But we don't check the result)
        fs.unlink(dest, cb); 
        return cb(err.message);
    });
}

function onDownloadFileDone(data) {
    if (data) {
        console.log(data);
    }
}