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
					countryLine[2],
					countryLine[1]
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
							icon: 'basketball'
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
}
class Country {
	constructor(name, newCoordinates, cases = 0, deaths = 0, recovered = 0) {
		this.cases = parseInt(cases);
		this.deaths = parseInt(deaths);
		this.recovered = parseInt(recovered);
		this.name = name.trim();
		this.coordinates = newCoordinates;
	}

	getName() {
		return this.name;
	}

	print() {
		console.log(
			'\t\t' +
				'Country: ' +
				this.name +
				'\t' +
				'Cases: ' +
				this.cases +
				'\t' +
				'Deaths: ' +
				this.deaths +
				'\t',
			'Recovered: ' + this.recovered
		);
	}
}
