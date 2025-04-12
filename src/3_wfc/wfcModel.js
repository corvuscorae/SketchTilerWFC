import ImageLearner from "./2_components/imageLearner.js";
import ConstraintSolver from "./2_components/constraintSolver.js";

export default class WFCModel {
	learner = new ImageLearner();
	solver = new ConstraintSolver();

	/**
	 * Learns the images' patterns and those patterns' weights and adjacencies.
 	 * Doesn't process images as periodic, and doesn't rotate or reflect patterns.
	 * @param {number[][][]} images an array of 2D tile ID matrices that each represent a layer of a tilemap
	 * @param {number} N the width and height of the learned patterns
	 * @param {bool} profile whether to profile the performance of this function or not
	 */
	learn(images, N, profile) {
		this.learner.learn(images, N, profile);
	}

	/**
	 * Attempts to create an output image based on the patterns, weights, and adjacencies learned from process().
	 * @param {number} width of output
	 * @param {number} height of output
	 * @param {number} maxAttempts
	 * @param {bool} logProgress whether to log the progress of this function or not
	 * @param {bool} profile whether to profile the performance of this function or not
	 * @returns {number[][] | null} an image as a 2D matrix of tile IDs if successful, or null if not
	 */
	generate(width, height, maxAttempts, logProgress, profile) {
		if (!this.learner.patterns) throw new Error("Model must learn before generating");
		return this.solver.solve(this.learner.patterns, this.learner.weights, this.learner.adjacencies, width, height, maxAttempts, logProgress, profile);
	}
}