const axios = require("axios");
const Day = require("./Day");
const Estimation = require("./Estimation");
const fs = require("fs");

const FUTURE_DAYS = 7;

class Timeline {
  constructor() {
    this.days = [];
  }

  async init(files) {
    this.details = await this.fetchCountryDetails();
    await this.processFiles(files);
    await this.futureDays();
    await this.genGeoJSON();
    // console.log(await this.days[0]);
    return await this.days;
  }

  async fetchCountryDetails() {
    return axios({
      method: "GET",
      url: "https://restcountries-v1.p.rapidapi.com/all",
      headers: {
        "content-type": "application/octet-stream",
        "x-rapidapi-host": "restcountries-v1.p.rapidapi.com",
        "x-rapidapi-key": "42752e8809msh0edf75d88c1b7e7p177e3djsn05d91367a12a"
      }
    })
      .then(async response => {
        return response.data;
      })
      .catch(error => {
        console.log("Couldn't find country details", error);
      });
  }

  async processFiles(files) {
    // Loops through each file, creating a new Day instance and extra data
    // parsing
    files.forEach(async day => {
      await this.processDay(day[0], day[1]);
    });
    console.log("processFiles()");
    return;
  }

  // Process a file representing the coronavirus statistics by country for that
  // day
  processDay(filename, content) {
    let day = new Day();
    // Prevents commas within quotes from messing up the seperation
    content = this.dealsWithQuoteMarks(content);
    // Seperating each lines
    const lines = content.split("\n");
    // Loops through each line
    for (let i = 1; i < lines.length; i++) {
      // console.log(lines[i]);
      // Extracts each line
      const regionLine = lines[i].split(",", -1);
      // Makes any elements that are blank 0
      for (let index = 1; index < regionLine.length; index++) {
        if (!regionLine[index] || regionLine[index].includes("\r")) {
          regionLine[index] = "0";
        }
      }
      // Prevents an error with undefined fields
      if (typeof regionLine[1] !== "undefined") {
        // Extracts constants from the region line
        const cases = regionLine[3].trim();
        // Checks if the entry is blank
        if (cases > 0) {
          const deaths = regionLine[4].trim();
          const recovered = regionLine[5].trim();
          const countryName = this.dictionary(regionLine[1].trim());
          const date = this.getFormattedDate(filename);
          const searchName = this.dictionaryCountryDetails(countryName);
          try {
            const countryDetails = this.searchCountryDetails(searchName);
            const { population, latlng, region: continent } = countryDetails;
            day.addData(
              cases,
              deaths,
              recovered,
              countryName,
              date,
              population,
              latlng,
              continent,
            );
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
    this.days.push(day);
    return;
  }

  // Prevents commas within quotes in a csv file from messing up the seperation
  dealsWithQuoteMarks(content) {
    let inQuote = false;
    for (let index = 0; index < content.length; index++) {
      let element = content.charAt(index);
      if (inQuote && element === ",") {
        // Deletes element
        content =
          content.slice(0, index - 1) + content.slice(index, content.length);
      } else if (element === '"') {
        // Deletes element
        content =
          content.slice(0, index - 1) + content.slice(index, content.length);
        if (inQuote) {
          inQuote = false;
        } else {
          inQuote = true;
        }
      }
    }
    return content;
  }

  // Checks if a country is present in a previous day but not the current day
  // And adds it to the current day if not
  async checkConcurrency(day, previousDay) {
    previousDay.countries.forEach(async function (country) {
      if (day.searchForCountry(country.name) === -1) {
        day.addData(
          country.cases,
          country.deaths,
          country.recovered,
          country.name,
          false
        );
      }
    });
  }

  searchCountryDetails(name) {
    return this.details.filter(country => {
      if (country.name === name) return true;
      return country.altSpellings.includes(name);
    })[0];
  }

  dictionaryCountryDetails(name) {
    switch (name) {
      case "Ireland":
        return "IE";
      case "Macedonia [FYROM]":
        return "MK";
      case "Vatican City":
        return "Vatican";
      case "Eswatini":
        return "SZ";
      case "Côte dIvoire":
        return "Ivory Coast";
      case "Congo [DRC]":
        return "DRC";
      case "Congo (Brazzaville)":
        return "Congo-Brazzaville";
      case "Kosovo":
        return "Republic of Kosovo";
      case "Palestinian Territories":
        return "Palestine";
      default:
        return name;
    }
  }

  getMax(type) {
    let max = 0;
    this.currentDay.forEach(feature => {
      if (feature.properties[type] > max) {
        max = feature.properties[type];
      }
    });
    return max;
  }

  async retrieveDay(index) {
    // console.log('Geojson' + JSON.stringify(this.geojson[index], null, 2));
    // console.log('\n\n\n\n' + index + '\n\n\n\n\n');
    return await this.days[index].geojson;
  }

  async genGeoJSON() {
    this.days.forEach(day => {
      day.parseGeoJSON();
    });
  }

  // calculates formatted date using the downloaded filename
  // returns formatted date
  getFormattedDate(downloadDate) {
    // Removes extension if necessary
    if (downloadDate.endsWith(".csv")) {
      downloadDate.replace(".csv", "");
    }
    // parses all date sections
    const sections = downloadDate.split("-");
    const day = sections[1];
    const month = sections[0];
    const year = sections[2];
    const dateVar = day + "/" + month + "/" + year;

    // returns formatted date
    return dateVar;
  }

  // Changes country names to match other parts of the database
  dictionary(countryName) {
    switch (countryName) {
      case "Mainland China":
        return "China";
      case "US":
        return "United States";
      case "UK":
        return "United Kingdom";
      case "Saint Barthelemy":
        return "France";
      case "occupied Palestinian territory":
      case "Palestine":
        return "Palestinian Territories";
      case "North Macedonia":
        return "Macedonia [FYROM]";
      case "Iran (Islamic Republic of)":
        return "Iran";
      case "Hong Kong SAR":
        return "Hong Kong";
      case "Viet Nam":
        return "Vietnam";
      case "Macao SAR":
        return "Macau";
      case "Russian Federation":
        return "Russia";
      case "Ivory Coast":
      case "Cote d'Ivoire":
        return "Côte dIvoire";
      case "Taiwan*":
        return "Taiwan";
      case "North Ireland":
        return "United Kingdom";
      case "Republic of Ireland":
        return "Ireland";
      case "Holy See":
        return "Vatican City";
      case "Czechia":
        return "Czech Republic";
      case "Reunion":
        return "France";
      case "Republic of Korea":
      case 'Sout"':
        return "South Korea";
      case "St. Martin":
      case "Saint Martin":
        return "France";
      case "Republic of Moldova":
        return "Moldova";
      case "Taipei and environs":
        return "Taiwan";
      case "Channel Islands":
        return "United Kingdom";
      case "Congo (Kinshasa)":
        return "Congo [DRC]";
      case "Cruise Ship":
      case "Others":
        return "Japan";
      default:
        return countryName;
    }
  }

  // Returns the date formatted as used in the url for files
  getStorageDate(date) {
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    const dateVar = day + "/" + month + "/" + year;
    return dateVar;
  }

  // Creates the days in the future that are predictions
  futureDays() {
    // Helps generate the formatted date
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let c = 0; c < FUTURE_DAYS; c++) {
      let lastDay = this.days[this.days.length - 1];
      let futureDay = new Day();
      lastDay.countries.forEach(country => {
        const {cases, deaths, recovered, name, population, coordinates, continent} = country;
        const date = this.getStorageDate(today);

        futureDay.addData(
          cases * 1.33,
          deaths * 1.33,
          recovered * 1.33,
          name,
          date,
          population,
          [coordinates[1], coordinates[0]],
          continent,
        );
      });
      
      futureDay.setIsEstimation(true);
      this.days.push(futureDay);
      today.setDate(today.getDate() + 1);
    }
  }
}

module.exports = Timeline;
