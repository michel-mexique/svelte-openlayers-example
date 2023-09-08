import { Control } from 'ol/control.js';

export default class MyCustomControl extends Control {
    /**
     * @param {Object} [opt_options] Control options.
     */
    constructor(opt_options) {
        const options = opt_options || {};

        const button = document.createElement('button');
        button.innerHTML = 'CC';

        const element = document.createElement('div');
        element.className = 'my-custom-control ol-unselectable ol-control';
        element.title = "Custom control"

        element.appendChild(button);

        super({
            element: element,
            target: options.target,
        });

        button.addEventListener('click', this.handleClick.bind(this), false);
    }

    handleClick() {
        // this.getMap().getView()...
        alert("My Custom Control was clicked")
    }
}

