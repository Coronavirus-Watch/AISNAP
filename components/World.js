const Territory = require("./Territory")

class World extends Territory {

    constructor(cases = 0, deaths = 0, recovered = 0, population = 0) {
        super(cases, deaths, recovered, population);
    }

    print() {
        console.log("Global:", "\n\t");
        super.print();
    }
}

module.exports = World;