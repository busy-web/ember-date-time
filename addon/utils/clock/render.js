/**
 * @module Utils/Clock
 *
 */
const renderMixin = Base => class extends Base {
	constructor(...args) {
		super(...args);

		this.isRendering = false;
	}

	startRender() { this.isRendering = true; }
	endRender() { this.isRendering = false; }

	renderDOM() {}

	render(...args) {
		if (!this.isRendering) {
			this.startRender();
			this.renderDOM(...args);
			this.endRender();
		}
	}
}

export default renderMixin;
