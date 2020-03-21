// const ASSUMED_DEATH_RATE = 
// const TRAVEL_RATE = 0.001;
// const DOUBLING_TIME = 6.18;
// const DEATH_TIME = 17.33;

class Territory {


    constructor(cases, deaths, recovered, population) {
        // Constants used to estimate case numbers
        // Credits to: Tomas Pueyo
        // Source: https://medium.com/@tomaspueyo/coronavirus-act-today-or-people-will-die-f4d3d9cd99ca
        this.ASSUMED_DEATH_RATE = 0.00874;

        // 
        this.cases = parseInt(cases);
        this.deaths = parseInt(deaths);
        this.recovered = parseInt(recovered);
        this.population = parseInt(population);

    }

    additionalData(cases = 0, deaths = 0, recovered = 0) {
        this.cases = this.cases + parseInt(cases);
        this.deaths = this.deaths + parseInt(deaths);
        this.recovered = this.recovered + parseInt(recovered);
        this.calculate();
    }

    calculate() {
        // Active confirmed cases
        this.active = (this.cases - this.deaths - this.recovered);
        // Case fatality ratio
        this.cfr = (this.deaths / this.cases);
        // Confirmed cases per 1 million people
        this.cpm = (this.cases / this.population) * 1000000;
        // Deaths per 1 million people
        this.dpm = (this.deaths / this.population) * 1000000;
        // // Daily Reproductive Rate
        // this.drr = this.active / yesterdayActive;
        // Estimated Active Cases
        this.estimated = Math.max(Math.round(this.cfr / this.ASSUMED_DEATH_RATE * this.active), this.active);
    }

    print() {
        console.log('Cases:', this.cases, '\t', 'Deaths:', this.deaths, '\t', 'Recovered:', this.recovered, 'Population:', this.population);
    }
}

module.exports = Territory