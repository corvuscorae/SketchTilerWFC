import DIRECTIONS from "./directions.js";
import Bitmask from "./bitmask.js";
import Queue from "./queue.js";

export default class ConstraintSolver {
	#waveMatrix;

	
}

/**
 * Attempts to create an output image based on the patterns, weights, and adjacencies from input images.
 * @param {number[][][]} patterns
 * @param {number[]} weights 
 * @param {Bitmask[][]} adjacencies
 * @param {number} width of output
 * @param {number} height of output
 * @returns {number[][] | null} an image as a 2D matrix of tile IDs if successful, or null if not
 */
function solve(patterns, weights, adjacencies, width, height, maxAttempts) {
	console.log("starting");

	let waveMatrix = createWaveMatrix(patterns.length, width, height);
	let numAttempts = 1;

	/*
		Since the very first cell to observe and propagate will always be a random one
		We can just choose a random cell instead of using getLeastEntropyUnsolvedCellPosition() to get one
		This means we get to skip a getLeastEntropyUnsolvedCellPosition() call
		Which is nice because calling that function on an initialized wave matrix (every cell has all patterns possible) gives it worst case runtime
	*/
	let y = Math.floor(Math.random() * height);	// random in range [0, outputHeight-1]
	let x = Math.floor(Math.random() * width);	// random in range [0, outputWidth-1]

	while (numAttempts <= maxAttempts) {	// use <= so maxAttempts can be 1
		observe(waveMatrix, y, x, weights);

		console.log("propagating...");
		const contradictionCreated = propagate(waveMatrix, y, x, adjacencies);
		if (contradictionCreated) {
			console.log("restarting");
			waveMatrix = createWaveMatrix(patterns.length, width, height);
			y = Math.floor(Math.random() * height);	// random in range [0, outputHeight-1]
			x = Math.floor(Math.random() * width);	// random in range [0, outputWidth-1]
			numAttempts++;
			continue;
		}

		[y, x] = getLeastEntropyUnsolvedCellPosition(waveMatrix, weights);
		if (y === -1 && x === -1) {
			console.log("solved! in " + numAttempts + " attempt(s)");
			return waveMatrixToImage(waveMatrix, patterns);
			break;
		}
	}

	console.log("max attempts reached");
	return false;
}

/**
 * Creates a 2D matrix of cells whose possible patterns are initialized to every pattern.
 * Because the only data a cell contains is its possible patterns Bitmask, the wave matrix is actually just a matrix of those Bitmasks.
 * @param {number} numPatterns 
 * @param {number} width of output
 * @param {number} height of output
 * @returns {Bitmask[][]}
 */
function createWaveMatrix(numPatterns, width, height) {
	const waveMatrix = [];
	for (let y = 0; y < height; y++) waveMatrix[y] = [];

	const allPatternsPossible = new Bitmask(numPatterns);
	for (let i = 0; i < numPatterns; i++) allPatternsPossible.setBit(i);

	for (let y = 0; y < height; y++) {
	for (let x = 0; x < width; x++) {
		waveMatrix[y][x] = Bitmask.createCopy(allPatternsPossible);
	}}
	
	return waveMatrix;
}

/**
 * Picks a pattern for a cell to become using weighted random.
 * @param {Bitmask[][]} waveMatrix a 2D matrix of cells (which are actually just their possible pattern Bitmasks)
 * @param {number} y 
 * @param {number} x 
 * @param {number[]} weights 
 */
function observe(waveMatrix, y, x, weights) {
	// used https://dev.to/jacktt/understanding-the-weighted-random-algorithm-581p

	const possiblePatterns = waveMatrix[y][x].toArray();

	const possiblePatternWeights = [];	// is parallel with possiblePatterns
	let totalWeight = 0;
	for (const i of possiblePatterns) {
		const w = weights[i];
		possiblePatternWeights.push(w);
		totalWeight += w;
	}

	const random = Math.random() * totalWeight;

	let cursor = 0;
	for (let i = 0; i < possiblePatternWeights.length; i++) {
		cursor += possiblePatternWeights[i];
		if (cursor >= random) {
			waveMatrix[y][x].clear();
			waveMatrix[y][x].setBit(possiblePatterns[i]);
			return;
		}
	}

	throw new Error("A pattern wasn't chosen within the for loop");
}

/**
 * Adjusts all cells' possible patterns if they need to due to the observation of a cell.
 * @param {Bitmask[][]} waveMatrix a 2D matrix of cells (which are actually just their possible pattern Bitmasks)
 * @param {number} y 
 * @param {number} x
 * @param {Bitmask[][]} adjacencies
 * @returns {boolean} whether a contradiction was created or not
 */
function propagate(waveMatrix, y, x, adjacencies) {
	const queue = new Queue();
	queue.enqueue([y, x]);

	while (queue.length > 0) {
		const [y1, x1] = queue.dequeue();
		const cell1_PossiblePatterns_Array = waveMatrix[y1][x1].toArray();

		for (let k = 0; k < DIRECTIONS.length; k++) {	// using k because k is associated with iterating over DIRECTIONS in the ImageProcessor class
			/*
				Given two adjacent cells: cell1 at (y1, x1) and cell2 at (y2, x2)

				Get cell2's currernt possible patterns
				Use the adjacency data of cell1's possible patterns to build a set of all possible patterns cell2 can be
				Create an array for cell2's new possible patterns by taking the shared elements between the two aforementioned data structures 

				If cell2's new possible patterns is the same size as its current: there were no changes - do nothing
				If cell2's new possible patterns is empty: there are no possible patterns cell2 can be - return contradiction
				If cell2's new possible patterns is smaller than its current: there were changes - enqueue cell2 so its adjacent cells can also be adjusted
			*/

			const dir = DIRECTIONS[k];
			const dy = -dir[0];	// need to reverse direction or else output will be upside down
			const dx = -dir[1];	// need to reverse direction or else output will be upside down
			const y2 = y1+dy;
			const x2 = x1+dx;

			// Don't go out of bounds
			if (y2 < 0 || y2 > waveMatrix.length-1) continue;
			if (x2 < 0 || x2 > waveMatrix[0].length-1) continue;

			const cell2_PossiblePatterns_Bitmask = waveMatrix[y2][x2];

			const cell1_PossibleAdjacentPatterns_Bitmask = new Bitmask(adjacencies.length);
			for (const i of cell1_PossiblePatterns_Array) {
				const i_AdjacentPatterns_Bitmask = adjacencies[i][k];
				cell1_PossibleAdjacentPatterns_Bitmask.combineWith(i_AdjacentPatterns_Bitmask);
			}

			const cell2_NewPossiblePatterns_Bitmask = Bitmask.AND(cell2_PossiblePatterns_Bitmask, cell1_PossibleAdjacentPatterns_Bitmask);

			const contradictionCreated = cell2_NewPossiblePatterns_Bitmask.isEmpty();
			if (contradictionCreated) return true;
			
			const cell2Changed = !(Bitmask.EQUALS(cell2_PossiblePatterns_Bitmask, cell2_NewPossiblePatterns_Bitmask));
			if (cell2Changed) {
				waveMatrix[y2][x2] = cell2_NewPossiblePatterns_Bitmask;
				queue.enqueue([y2, x2]);
			}
		}
	}
	return false;	// no contradiction created
}

/**
 * Get the position of the cell with the least entropy that's not 0. If all cells are solved, returns [-1, -1].
 * @param {Bitmask[][]} waveMatrix a 2D matrix of cells (which are actually just their possible pattern Bitmasks)
 * @param {number[]} weights
 * @returns {number[]} [y, x] if there's an unsolved cell or [-1, -1] if there aren't any
 */
function getLeastEntropyUnsolvedCellPosition(waveMatrix, weights) {
	/*
		Build an array containing the positions of all cells tied with the least entropy
		Return a random position from that array
	*/

	let leastEntropy = Infinity;
	let leastEntropyCellPositions = [];

	for (let y = 0; y < waveMatrix.length; y++) {
	for (let x = 0; x < waveMatrix[0].length; x++) {
		const entropy = getShannonEntropy(waveMatrix[y][x], weights);
		if (entropy < leastEntropy && entropy > 0) {
			leastEntropy = entropy;
			leastEntropyCellPositions = [[y, x]];
		}
		else if (entropy === leastEntropy) {
			leastEntropyCellPositions.push([y, x]);
		}
	}}

	const len = leastEntropyCellPositions.length;
	if (len > 0) return leastEntropyCellPositions[Math.floor(Math.random() * len)];	// random element (cell position)
	else return [-1, -1];
}

/**
 * Gets the Shannon Entropy of a cell using its possible patterns and those patterns' weights.
 * @param {Bitmask} bitmask 
 * @param {number[]} weights 
 * @returns {number}
 */
function getShannonEntropy(bitmask, weights) {
	const possiblePatterns = bitmask.toArray();

	if (possiblePatterns.length === 0) throw new Error("Contradiction found.");
	if (possiblePatterns.length === 1) return 0;	// what the calculated result would have been

	let sumOfWeights = 0;
	let sumOfWeightLogWeights = 0;
	for (const i of possiblePatterns) {
		const w = weights[i];
		sumOfWeights += w;
		sumOfWeightLogWeights += w * Math.log(w);
	}

	return Math.log(sumOfWeights) - sumOfWeightLogWeights/sumOfWeights;
}

/**
 * Build a 2D image matrix using the top left tile of each cell's pattern.
 * @param {Bitmask[][]} waveMatrix a 2D matrix of cells (which are actually just their possible pattern Bitmasks)
 * @param {number[][][]} patterns 
 * @returns {number[][]}
 */
function waveMatrixToImage(waveMatrix, patterns) {
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

const totalDurations = new Map();
const numCalls = new Map();

/**
 * A function wrapper that records how long a function takes to run in ms.
 * @param {Function} targetFunction the function being timed/wrapped
 * @param {any[]} args an array storing the arguments that will be passed to the target function
 * @returns {any} what targetFunction returns
 */
function time(targetFunction, args) {
	const start = performance.now();
	const result = targetFunction(...args);	// it's okay if the function doesn't have parameters because you can still do this in JS
	const duration = performance.now() - start;

	if (totalDurations.has(targetFunction.name)) totalDurations.set(targetFunction.name, totalDurations.get(targetFunction.name) + duration);
	else totalDurations.set(targetFunction.name, duration);

	if (numCalls.has(targetFunction.name)) numCalls.set(targetFunction.name, numCalls.get(targetFunction.name) + 1);
	else numCalls.set(targetFunction.name, 1);

	return result;
}