const axios = require('axios');

// Constants used to estimate case numbers
// Credits to: Tomas Pueyo
// Source: https://medium.com/@tomaspueyo/coronavirus-act-today-or-people-will-die-f4d3d9cd99ca
const ASSUMED_DEATH_RATE = 0.874;
const TRAVEL_RATE = 0.001;
const DOUBLING_TIME = 6.18;
const DEATH_TIME = 17.33;

class Country {
	constructor(
		cases = '0',
		deaths = '0',
		recovered = '0',
		name = '',
		population = 0,
		coordinates = 0,
		continent = ''
	) {
		this.cases = parseInt(cases);
		this.deaths = parseInt(deaths);
		this.recovered = parseInt(recovered);
		this.name = name;
		this.population = population;
		this.coordinates = coordinates;
		this.continent = continent;
		this.estimatedDay = false;
		this.calculate();
	}

	additionalData(cases = '0', deaths = '0', recovered = '0') {
		this.cases = this.cases + parseInt(cases);
		this.deaths = this.deaths + parseInt(deaths);
		this.recovered = this.recovered + parseInt(recovered);
	}

	calculate() {
		// Active confirmed cases
		this.active = this.cases - this.deaths - this.recovered;
		// Case fatality ratio
		this.cfr = this.deaths / this.cases;
		// Confirmed cases per 1 million people
		this.cpm = (this.cases / this.population) * 1000000;
		// Deaths per 1 million people
		this.dpm = (this.deaths / this.population) * 1000000;
		// // Daily Reproductive Rate
		// this.drr = this.active / yesterdayActive;
		// Estimated Cases
		this.estimated = (this.cfr / ASSUMED_DEATH_RATE) * this.active;
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

module.exports = Country;
