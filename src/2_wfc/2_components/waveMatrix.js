export default class WaveMatrix {
    #cells;

    constructor(width, height, numPatterns) {

    }

    toImage() {

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