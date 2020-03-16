const Day = require('./Day');
const fs = require('fs');

class Timeline {
	constructor() {
		this.days = [];
		this.json = [];
	}

	async init() {
		await this.fetchJson();
	}

	async fetchJson() {
		const res = await fs.readFileSync('./data/timeline.json', 'utf8');

		// parses the response data into json format
		const json = await JSON.parse(res);

		// sets the JSON data to the retrieved file content
		await this.parseJson(json);
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

	async parseJson(json) {
		// loops through json per day
		json.forEach(async day => {
			// creates a new instance of a Day
			let newDay = new Day(day.day);
			// loops through each country that day
			day.countries.forEach(async country => {
				// adds data provided to the day instnace
				newDay.addData(
					country.cases,
					country.deaths,
					country.recovered,
					country.name
				);
			});

			// generates GeoJSON relative to the created Day
			await newDay.parseGeoJSON();
			// pushes new day to array or something
			this.days.push(newDay);
			// newDay.print();
		});
	}
}

module.exports = Timeline;
