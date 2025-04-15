import ImageLearner from "./2_components/imageLearner.js";
import ConstraintSolver from "./2_components/constraintSolver.js";

export default class WFCModel {
	imageLearner = new ImageLearner();
	constraintSolver = new ConstraintSolver();

	/**
	 * Learns the images' patterns and those patterns' weights and adjacencies.
 	 * Doesn't process images as periodic, and doesn't rotate or reflect patterns.
	 * @param {TilemapImage[]} images an array of 2D tile ID matrices that each represent a layer of a tilemap
	 * @param {number} N the width and height of the patterns
	 * @param {bool} profile whether to profile the performance of this function or not
	 */
	learn(images, N, profile) {
		this.imageLearner.learn(images, N, profile);
	}

	/**
	 * Attempts to create an output image based on the patterns, weights, and adjacencies learned from process().
	 * @param {number} width The width of the output image.
	 * @param {number} height The height of the output image.
	 * @param {number} maxAttempts
	 * @param {bool} logProgress Whether to log the progress of this function or not.
	 * @param {bool} profile Whether to profile the performance of this function or not.
	 * @returns {TilemapImage | null} an image as a 2D matrix of tile IDs if successful, or null if not
	 */
	generate(width, height, maxAttempts, logProgress, profile) {
		if (!this.imageLearner.patterns) throw new Error("Model must learn before generating");
		return this.constraintSolver.solve(this.imageLearner.patterns, this.imageLearner.weights, this.imageLearner.adjacencies, width, height, maxAttempts, logProgress, profile);
	}
}