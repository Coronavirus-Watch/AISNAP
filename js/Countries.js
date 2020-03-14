export class Countries {
	constructor() {
		this.countries = {};
		this.geojson = [];
	}
	async init() {
		await this.fetchCountries();
	}

	async fetchCountries() {
		// retrieves data from countries file
		const response = await fetch('../data/countries.txt');
		// parses data into text
		const data = await response.text();
		this.parseCountries(data);
	}

	async parseCountries(text) {
		// splits the text into lines in the file
		const lines = text.split('\n');
		for (let i = 0; i < lines.length; i++) {
			// Extracts each line
			const countryLine = lines[i].split(',');
			// Adds to the markers Object with respective lat, lon based on the country
			if (countryLine[1] != undefined && countryLine[2] != undefined) {
				this.countries[
					countryLine[3].trim()
				] = new Country(countryLine[3], [
					parseFloat(countryLine[2]),
					parseFloat(countryLine[1])
				]);
			}
		}
	}

	parseGeoJSON() {
		let tempArray = [];
		if (this.countries) {
			for (let country in this.countries) {
				try {
					tempArray.push({
						type: 'Feature',
						geometry: {
							type: 'Point',
							coordinates: this.countries[country].coordinates
						},
						properties: {
							title: this.countries[country].name,
							icon: 'basketball',
							cases: this.countries[country].cases,
							deaths: this.countries[country].deaths,
							recovered: this.countries[country].recovered
						}
					});
				} catch (e) {
					console.log(e);
				}
			}
		} else {
			console.log('Countries is undefined');
		}
		this.geojson = tempArray;
	}

	addVirus(countryObj) {
		if (this.countries[countryObj.name]) {
			this.countries[countryObj.name].cases = countryObj.cases;
			this.countries[countryObj.name].deaths = countryObj.deaths;
			this.countries[countryObj.name].recovered = countryObj.recovered;
		}
	}

	getCountryCoordinates(country) {
		if (this.countries[country.name]) {
			return this.countries[country.name].coordinates;
		}
		console.log('Country Not Found: ' + country.name);
		return [0, 0];
	}
}
class Country {
	constructor(name, newCoordinates, cases = 0, deaths = 0, recovered = 0) {
		this.cases = parseInt(cases);
		this.deaths = parseInt(deaths);
		this.recovered = parseInt(recovered);
		this.name = name.trim();
		this.coordinates = newCoordinates;
	}
}
