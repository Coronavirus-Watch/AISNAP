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

	async getRange() {
		return this.json.length - 1;
	}

	async fetchJson() {
		const res = await fs.readFileSync('./data/timeline.json', 'utf8');

		// parses the response data into json format
		const json = await JSON.parse(res);

		console.log(res.data);
		// im going to go get some dinner and work on this after
		// can i commit to github and then let you know when i get back?
		// Ok, that's fine I'll work locally then, great, enjoy

		// sets the JSON data to the retrieved file content
		this.json = await json;
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
		return await this.days[index].geojson;
	}

	async parseJson() {
		// console.log(this.json[0][0]);
		// this ^ isn't working

		// loops through json per day
		this.json.forEach(async day => {
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

			console.log(newDay.countries['China']);
		});
	}
}

module.exports = Timeline;
