export class Day {
	constructor(json, countriesInstance) {
		this.geojson = [];
		this.init(json, countriesInstance);
	}

	async init(json, countriesInstance) {
		await this.parseDay(json, countriesInstance);
	}

	parseDay(json, countriesInstance) {
		json.countries.forEach(country => {
			this.geojson.push({
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: countriesInstance.getCountryCoordinates(
						country
					)
				},
				properties: {
					title: country.name,
					icon: 'basketball',
					cases: country.cases,
					deaths: country.deaths,
					recovered: country.recovered
				}
			});
		});
	}
}
