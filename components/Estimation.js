const fs = require('fs')

const CONTAGION_PATH = '../data/contagion.csv';

let spread = [];

function processContagion() {
    const file = fs.readFileSync(CONTAGION_PATH, 'utf8');
    const lines = file.split("\n");
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        switch (i) {
            case 2:
                addCases(line);
                break;
            
            default:
                break;
        }
    }
}

function addCases(line) {

}