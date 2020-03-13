export class Timeline {
	constructor() {
		this.timeline = [];
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
					},
					properties: {
						title: country.name,
						icon: 'basketball'
					}
				});
			});
		});
	}

	async addCoordinates(countries) {}
}
