class Country {
	constructor(cases = '0', deaths = '0', recovered = '0', name) {
		this.cases = parseInt(cases);
		this.deaths = parseInt(deaths);
		this.recovered = parseInt(recovered);
		this.name = name;
	}

	additionalData(cases = '0', deaths = '0', recovered = '0') {
		this.cases = this.cases + parseInt(cases);
		this.deaths = this.deaths + parseInt(deaths);
		this.recovered = this.recovered + parseInt(recovered);
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
