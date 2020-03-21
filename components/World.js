const Territory = require('./Territory');

class World extends Territory {
	constructor() {
		super(0, 0, 0, 0);
	}

	additionalData(cases, deaths, recovered) {
		super.additionalData(cases, deaths, recovered);
	}

	print() {
		console.log('Global:', '\n\t');
		super.print();
	}
}

module.exports = World;
