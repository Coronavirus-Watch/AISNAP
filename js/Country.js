export class Country {
	constructor(
		cases = '0',
		deaths = '0',
		recovered = '0',
		lat = 0.0,
		lon = 0.0,
		name
	) {
		this.cases = parseInt(cases);
		this.deaths = parseInt(deaths);
		this.recovered = parseInt(recovered);
		this.name = name;
		this.coordinates = {
			lat: 0,
			lon: 0
		};
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
