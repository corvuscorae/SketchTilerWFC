import process from "./2_components/imageProcessor.js";
import solve from "./2_components/constraintSolver.js";

export default class WFC {
	#patterns;
	#weights;
	#adjacencies;

	/**
	 * Learns the images' patterns and those patterns' weights and adjacencies.
 	 * Doesn't process images as periodic, and doesn't rotate or reflect patterns.
	 * @param {number[][][]} images an array of 2D tile ID matrices each representing a layer of a tilemap
	 * @param {number} N the width of the resulting square patterns
	 */
	process(images, N) {
		[this.#patterns, this.#weights, this.#adjacencies] = process(images, N);
	}

	/**
	 * Attempts to create an output image based on the patterns, weights, and adjacencies learned from process().
	 * @param {number} width of output
	 * @param {number} height of output
	 * @param {number} maxAttempts
	 * @returns {number[][] | null} an image as a 2D matrix of tile IDs if successful, or null if not
	 */
	generate(width, height, maxAttempts) {
		if (!this.#patterns || !this.#weights || !this.#adjacencies) throw new Error("WFC must process images before generating");
		return solve(this.#patterns, this.#weights, this.#adjacencies, width, height, maxAttempts);
	}
}