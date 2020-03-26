const axios = require("axios");
const Day = require("./Day");

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
		for (let i = 1; i < lines.length; i++) {
			// Segments each line
			const regionLine = lines[i].split(",", -1);
			// Makes any elements that are blank 0
			for (let index = 1; index < regionLine.length; index++) {
				if (!regionLine[index] || regionLine[index].includes("\r")) {
					regionLine[index] = "0";
				}
			}
			// Prevents an error with undefined fields
			if (typeof regionLine[1] !== "undefined") {
				// Extracts data from the line and adds it to the appropriate day
				this.extractData(day, filename, regionLine);
			}
		}
		this.days.push(day);
		return;
	}

	extractData(day, filename, regionLine) {
		const dateObj = this.convertToDateObj(filename);
		const cutOff = new Date(2020, 3, 22);
		// Calculates formatted date using the downloaded filename
		const date = this.getFormattedDate(filename);
		if (dateObj < cutOff) {
			this.extractDataV1(day, date, regionLine);
		}
		else {
			this.extractDataV2(day, date, regionLine);
		}
	}

	convertToDateObj(dateString) {
		// Removes extension if necessary
		if (dateString.endsWith(".csv")) {
			dateString.replace(".csv", "");
		}
		// Parses all date sections
		const sections = dateString.split("-");
		const day = sections[1];
		const month = sections[0];
		const year = sections[2];
		let dateVar = new Date(year, month, day);
		// https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_daily_reports/03-23-2020.csv
		// Old formatting: https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_daily_reports/03-21-2020.csv
		return dateVar;
	}

	// Extracts data from the line and adds it to the appropriate day
	extractDataV1(day, date, regionLine) {
		// Extracts cases from the region line
		const cases = regionLine[3].trim();
		// Checks if the entry is blank
		if (cases <= 0) {
			return;
		}

		// Extracts more constants from the region line
		const deaths = regionLine[4].trim();
		const recovered = regionLine[5].trim();
		// Changes country names from downloaded files into ones that are used to store countries
		const countryName = this.dictStore(regionLine[1].trim());
		// Changes country nams from the ones stored to lookup data in the Rest countries API
		const searchName = this.dictRest(countryName);

		try {
			// Looks up other information from country details array
			const countryDetails = this.searchCountryDetails(searchName);
			if (typeof countryDetails === "undefined")
				throw "Error finding country details for: " + searchName;
			const {
				population,
				latlng,
				region: continent,
				altSpellings
			} = countryDetails;

			// Adds data to the day
			let country = day.addData(
				cases,
				deaths,
				recovered,
				countryName,
				date,
				population,
				latlng,
				continent,
				altSpellings
			);

			// Extracts data from yesterdays result
			let varsArray = [0, 0, 0, 0];
			let yesterday;
			let index = -1;
			if (this.days.length !== 0) {
				yesterday = this.days[this.days.length - 1];
				index = yesterday.searchForCountry(
					countryName
				);
			}
			if (index !== -1) {
				let countryYesterday = yesterday.countries[index];
				varsArray = countryYesterday.getVarsArray();
			}
			// Compares data from this day and the previous to calculate increases
			country.comparison(varsArray);
		} catch (error) {
			// console.log('General Error for: ' + searchName);
			console.error(error);
		}
	}

	// It's weird that it screws up on the very last file
	// which date? 25/03/2020
	// is it all countries on the 25th or is it just finding
	// errors on the 25th?
	// Given it's not an async function, it seems to be just multiple countries or so on the 25th
	// But probably not all

	// Extracts data from the line and adds it to the appropriate day
	extractDataV2(day, date, regionLine) {
		// if (date === "25/03/2020") {
		// 	// console.log(regionLine);
		// }
		try {
			// Extracts cases from the region line
			const cases = regionLine[7].trim();
			// Checks if the entry is blank
			if (cases <= 0) {
				return;
			}
			// Extracts more constants from the region line
			const deaths = regionLine[8].trim();
			const recovered = regionLine[9].trim();
			// Changes country names from downloaded files into ones that are used to store countries
			const countryName = this.dictStore(regionLine[3].trim());
			// Changes country nams from the ones stored to lookup data in the Rest countries API
			const searchName = this.dictRest(countryName);

			// Looks up other information from country details array
			const countryDetails = this.searchCountryDetails(searchName);
			if (typeof countryDetails === "undefined")
				// This always ran because the variables would be undefined when they were in a try catch
				throw "Error finding country details for: " + searchName;
			const {
				population,
				latlng,
				region: continent,
				altSpellings
			} = countryDetails;

			// Adds data to the day
			let country = day.addData(
				cases,
				deaths,
				recovered,
				countryName,
				date,
				population,
				latlng,
				continent,
				altSpellings
			);

			// Extracts data from yesterdays result
			let varsArray = [0, 0, 0, 0];
			let yesterday;
			let index = -1;
			if (this.days.length !== 0) {
				yesterday = this.days[this.days.length - 1];
				index = yesterday.searchForCountry(
					countryName
				);
			}
			if (index !== -1) {
				let countryYesterday = yesterday.countries[index];
				varsArray = countryYesterday.getVarsArray();
			}
			// Compares data from this day and the previous to calculate increases
			country.comparison(varsArray);
		} catch (error) {
			// console.log(regionLine);
			// console.log('General Error for: ', date, searchName);
			// console.error(error);
		}
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

	// // Checks if a country is present in a previous day but not the current day
	// // And adds it to the current day if not
	// async checkConcurrency(day, previousDay) {
	// 	previousDay.countries.forEach(async function(country) {
	// 		if (day.searchForCountry(country.name) === -1) {
	// 			day.addData(
	// 				country.cases,
	// 				country.deaths,
	// 				country.recovered,
	// 				country.name,
	// 				false
	// 			);
	// 		}
	// 	});
	// }

	// Looks up information about a country from the country details array
	searchCountryDetails(name) {
		return this.details.filter(country => {
			if (country.name === name) return true;
			return country.altSpellings.includes(name);
		})[0];
	}

	// Gets the highest value of a property in the days array
	getMax(type) {
		let max = 0;
		this.currentDay.forEach(feature => {
			if (feature.properties[type] > max) {
				max = feature.properties[type];
			}
		});
		return max;
	}

	// Gets geojson data for a particular day
	async retrieveDay(index) {
		return await this.days[index].geojson;
	}

	// Generates geojson data for all days
	async genGeoJSON() {
		this.days.forEach(day => {
			day.parseGeoJSON();
		});
	}

	// Calculates formatted date using the downloaded filename
	getFormattedDate(downloadDate) {
		// Removes extension if necessary
		if (downloadDate.endsWith(".csv")) {
			downloadDate.replace(".csv", "");
		}
		// Parses all date sections
		const sections = downloadDate.split("-");
		const day = sections[1];
		const month = sections[0];
		const year = sections[2];
		const dateVar = day + "/" + month + "/" + year;
		return dateVar;
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

		// Adds each day in the future
		for (let c = 0; c < FUTURE_DAYS; c++) {
			let lastDay = this.days[this.days.length - 1];
			let futureDay = new Day();
			futureDay.isEstimation = true;
			lastDay.countries.forEach(country => {
				const {
					cases,
					deaths,
					recovered,
					name,
					population,
					coordinates,
					continent
				} = country;
				const date = this.getStorageDate(today);
				const increases = this.calculateIncrease(country.name);
				// console.log("Day:", date, "Country:", country.name, increases);
				futureDay.addData(
					cases + (cases * increases[0]),
					deaths + (deaths * increases[1]),
					recovered + (recovered * increases[2]),
					name,
					date,
					population,
					[coordinates[1], coordinates[0]],
					continent
				);
			});

			this.days.push(futureDay);
			today.setDate(today.getDate() + 1);
		}
	}

	calculateIncrease(countryName) {
		const ESTIMATED_INCREASE_DAYS = 3;

		const startIndex = this.days.length - ESTIMATED_INCREASE_DAYS;
		const lastIndex = this.days.length - 1;
		try {
			if (startIndex < 0 || lastIndex < 0) throw "Negative day index";
			let startDay = this.days[startIndex];
			let lastDay = this.days[lastIndex];
			const startCountryIndex = startDay.searchForCountry(countryName);
			const lastCountryIndex = lastDay.searchForCountry(countryName);
			if (startCountryIndex < 0 || lastCountryIndex < 0) throw "Negative country index";
			let startCountry = startDay.countries[startCountryIndex];
			let lastCountry = lastDay.countries[lastCountryIndex];
			// Average increases in cases
			let aiCases = (lastCountry.cases - startCountry.cases) / startCountry.cases / ESTIMATED_INCREASE_DAYS;
			if (isNaN(aiCases)) aiCases = 0;
			let aiDeaths = (lastCountry.deaths - startCountry.deaths) / startCountry.deaths / ESTIMATED_INCREASE_DAYS;
			if (isNaN(aiDeaths)) aiDeaths = 0;
			let aiRecovered = (lastCountry.recovered - startCountry.recovered) / startCountry.recovered / ESTIMATED_INCREASE_DAYS;
			if (isNaN(aiRecovered)) aiRecovered = 0;
			return [aiCases, aiDeaths, aiRecovered];
		}
		catch (e) {
			console.log(e);
			return [0, 0, 0];
		}
	}

	// Changes country names from downloaded files into ones that are used to store countries
	dictStore(countryName) {
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
			case 'Th"':
				return "The Gambia";
			case "Cruise Ship":
			case "Others":
				return "Japan";
			default:
				return countryName;
		}
	}

	// Changes country names from the ones stored to lookup data in the Rest countries API
	dictRest(name) {
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
			case "Cabo Verde":
				return "Cape Verde";
			case "Timor-Leste":
				return "East Timor";
			default:
				return name;
		}
	}
}

module.exports = Timeline;
