// Stores the countries
let infected = {};

class Country {
    constructor(name = "", totalCases = 0, newCases = 0, totalDeaths = 0, newDeaths = 0, totalRecovered = 0, seriousOrCritical = 0) {
        this.name = name;
        this.totalCases = totalCases;
        this.newCases = newCases;
        this.totalDeaths = totalDeaths;
        this.newDeaths = newDeaths;
        this.totalRecovered = totalRecovered;
        this.seriousOrCritical = seriousOrCritical;

        if (totalCases > 0) {
            this.affected = true;
        }
        else {
            this.affected = false;
        }
        this.calcStats();
    }

    parseConstructor(country) {
        const infectedLine = country.split(',');
        name = infectedLine[0].trim();
        totalCases = parseInt(infectedLine[1].trim());
        newCases = parseInt(infectedLine[2].trim());
        totalDeaths = parseInt(infectedLine[3].trim());
        newDeaths = parseInt(infectedLine[4].trim());
        totalRecovered = parseInt(infectedLine[5].trim());
        seriousOrCritical = parseInt(infectedLine[6].trim());

        if (totalCases > 0) {
            this.affected = true;
        }
        this.calcStats();
    }

    calcStats() {
        if (affected) {
            this.deathPerc = parseFloat((this.totalDeaths - this.newDeaths) / (this.totalCases - this.newCases));
            this.recoveryRate = parseFloat(this.totalRecovered / this.totalCases);
            this.criticalRate = parseFloat(this.seriousOrCritical / this.totalCases);
        }
    }
}

function getCoronaStats() {
    // Fetches Location Data of Countries
    fetch('../data/coronaCountries.txt')
        .then(res => res.text())
        .then(res => {
            // Parses the text
            infected = parseInfected(res);
            console.log("Infected Length:" + infected.length);
            infected.forEach(element => {
                console.log("Infected Country: " + element + " Total Cases: " + element.totalCases + " New Cases: " + element.newCases + " Total Deaths: " + element.totalDeaths + " New Deaths: " + element.newDeaths + " Total Recovered: " + element.totalRecovered + " Serious/Critical: " + element.seriousOrCritical);
            });
        });
}

// Parses the text
function parseInfected(text) {
    // Seperating each lines
    const lines = text.split('\n');
    // Loops through each line
    for (let i = 0; i < lines.length; i++) {
        // Adds to the infected array
        infected[infectedLine[0].trim()] = new Country().parseConstructor(lines[i]);
    }
    return countries;
}

