import ImageLearner from "./2_components/imageLearner.js";

export default class WFCModel {
	#learner = new ImageLearner();
	#learned = false;

	/**
	 * Learns the images' patterns and those patterns' weights and adjacencies.
 	 * Doesn't process images as periodic, and doesn't rotate or reflect patterns.
	 * @param {number[][][]} images an array of 2D tile ID matrices that each represent a layer of a tilemap
	 * @param {number} N the width and height of the learned patterns
	 * @param {bool} time whether to time the performance of this function or not
	 */
	learn(images, N, time) {
		this.#learner.learn(images, N, time);
		this.#learned = true;
	}

	/**
	 * Attempts to create an output image based on the patterns, weights, and adjacencies learned from process().
	 * @param {number} width of output
	 * @param {number} height of output
	 * @param {number} maxAttempts
	 * @returns {number[][] | null} an image as a 2D matrix of tile IDs if successful, or null if not
	 */
	generate(width, height, maxAttempts) {
		if (!this.#learned) throw new Error("WFC must learn before generating");
		//return solve(this.#patterns, this.#weights, this.#adjacencies, width, height, maxAttempts);
	}

	debug() {
		console.log(this.#learner);
	}
}