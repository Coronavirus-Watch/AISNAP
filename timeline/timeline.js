// This is designed to download and eventually update the coronavirus dataset
// Eventually this would be run by the server periodically as the WHO updates the dataset

// Data source: https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports

const fs = require('fs');
const http = require('http');
const request = require('request');
const tempPath = "../data/tmp";
const source = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";

http.createServer(function (req, res) {
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
    // Cleanup

}).listen(8080); 

// Identifies source files to download
function download() {
    // Sets the first file to look at
    const date = new Date("2020-01-22");
    var today = new Date();
    // Runs though all the files
    while (date <= today) {
        // Returns the date formatted as used in the url for files
        var formatted = getDateFormatted(date);
        //
        downloadFile(source + "/" + formatted + ".csv", tempPath);
        // 
        date.setDate(date.getDate() + 1);
    }
}

// Returns the date formatted as used in the url for files
function getDateFormatted(date) {
    var day = ("0" + String(date.getDate())).slice(-2);
    var month = ("0" + String(date.getMonth() + 1)).slice(-2);
    var year = date.getFullYear();
    
    var dateVar = String(month + "-" + day + "-" + year);
    console.log("Date: " + dateVar);
    return dateVar;
}

// Credits: https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
function downloadFile(url, dest, cb) {
    const file = fs.createWriteStream(dest);
    const sendReq = request.get(url);

    // verify response code
    sendReq.on('response', (response) => {
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }
        sendReq.pipe(file);
    });

    // close() is async, call cb after close completes
    file.on('finish', () => file.close(cb));

    // check for request errors
    sendReq.on('error', (err) => {
        fs.unlink(dest);
        return cb(err.message);
    });

    // Handle errors
    file.on('error', (err) => { 
        // Delete the file async. (But we don't check the result)
        fs.unlink(dest); 
        return cb(err.message);
    });
}