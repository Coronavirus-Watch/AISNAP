export class Timeline {
	constructor() {
		this.timeline = [];
		this.geojson = [];
	}
	async init() {
		await this.fetchTimeline();
	}
	// async all the functions! MWAHAHAAHHA
	async getRange() {
		// beautiful
		return this.timeline.length - 1;
	}

	async fetchTimeline() {
		// retrieves text data from file
		const res = await fetch('../data/timeline.json');
		// parses the response data into plain text
		const json = await res.json();
		// parses the data into a routes Object
		this.timeline = await json;
		await this.parseTimeline(json);
	}

	async parseTimeline(json) {
		console.log(json);
		json.forEach(day => {
			day.countries.forEach(country => {
				this.geojson.push({
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [0, 0]
						// coordinates: this.routes.getCountryCoordinates(country.name)
					},
					properties: {
						title: country.name,
						icon: 'basketball'
					},
					stats: {
						cases: country.cases,
						deaths: country.deaths,
						recovered: country.recovered,
						name: country.name
					}
				});
			});
		});
	}

	async addCoordinates(routes) {
		this.geojson.forEach( element => {
			element.coordinates = routes.getCountryCoordinates(element.stats.name);
		});
	}
}
