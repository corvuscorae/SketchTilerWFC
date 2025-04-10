import ImageLearner from "./2_components/imageLearner";
import ConstraintSolver from "./2_components/constraintSolver";

export default class WFCModel {
	#patterns;
	#weights;
	#adjacencies;

	/**
	 * Learns the images' patterns and those patterns' weights and adjacencies.
 	 * Doesn't process images as periodic, and doesn't rotate or reflect patterns.
	 * @param {number[][][]} images an array of 2D tile ID matrices each representing a layer of a tilemap
	 * @param {number} N the width of the resulting square patterns
	 */
	learn(images, N) {
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

	/**
	 * Build a 2D image matrix using the top left tile of each cell's pattern.
	 * @param {Bitmask[][]} waveMatrix a 2D matrix of cells (which are actually just their possible pattern Bitmasks)
	 * @param {number[][][]} patterns 
	 * @returns {number[][]}
	 */
	#waveMatrixToImage(waveMatrix, patterns) {
		const image = [];
		for (let y = 0; y < waveMatrix.length; y++) image[y] = [];

		for (let y = 0; y < waveMatrix.length; y++) {
		for (let x = 0; x < waveMatrix[0].length; x++) {
			const possiblePatterns_Array = waveMatrix[y][x].toArray();
			const i = possiblePatterns_Array[0];	// should be guaranteed to only have 1 possible pattern
			const tileID = patterns[i][0][0];
			image[y][x] = tileID;
		}}

		return image;
	}
}