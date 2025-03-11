import ImageProcessor from "./imageProcessor";
import ConstraintSolver from "./constraintSolver";

export default class WFC {
	ip = new ImageProcessor();
	cs = new ConstraintSolver();
	ipData = [];

	/**
	 * @param {number[][][]} images an array of 2D tile ID matrices
	 * @param {number} N
	 */
	process(images, N) {
		ipData = this.ip.process(images, N);
	}

	/**
	 * @param {number} outputWidth
	 * @param {number} outputHeight
	 * @param {number} maxAttempts
	 * @returns {number[][] | null} a 2D tile ID matrix or null if generation failed
	 */
	generate(outputWidth, outputHeight, maxAttempts) {
		
	}
}