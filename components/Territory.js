class Territory {
    constructor() {
        // Enforces this as Abstract class
        if (this.constructor === Widget) {
            throw new TypeError('Abstract class "Widget" cannot be instantiated directly.');
        }

        if (this.schema === undefined) {
            throw new TypeError('Classes extending the widget abstract class');
        }
    }
}

module.exports = Territory