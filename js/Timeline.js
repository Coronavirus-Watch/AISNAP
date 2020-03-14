import { Routes } from './Routes.js';
import { Countries } from './Countries.js';
import { Day } from './Day.js';
export class Timeline {
	constructor() {
		this.countriesInstance = new Countries();
		this.routes = new Routes();
		this.timeline = [];
		this.geojson = [];
		this.currentDay = [];
	}
	async init() {
		await this.countriesInstance.init();
		await this.countriesInstance.parseGeoJSON();
		await this.routes.init(this.countriesInstance.countries);
		await this.routes.parseGeoJSON();
		await this.fetchTimeline();
	}

	async getRange() {
		return this.timeline.length - 1;
	}

	async fetchTimeline() {
		// retrieves text data from file
		const res = await fetch('../data/timeline.json');
		// parses the response data into plain text
		const json = await res.json();
		// parses the data into a routes Object
		this.timeline = await json;
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
		this.currentDay = await this.geojson[index].geojson;
		return this.currentDay;
	}

	async parseTimeline() {
		this.timeline.forEach(day => {
			const newDay = new Day(day, this.countriesInstance);
			this.geojson.push(newDay);
		});
		this.currentDay = this.geojson[0].geojson;
		// Why are countries disappearing from the map?
		// was about to say
		// Ok think I've figured it out, there's sone countries in the timeline with all zeros
		// where and which timeline
	}

	async addCoordinates(routes) {
		this.countriesInstance.forEach(country => {
			country.coordinates = routes.getCountryCoordinates(country.name);
		});
	}
}
