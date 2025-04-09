import DIRECTIONS from "./directions.js";
import Bitmask from "./bitmask.js";

/**
 * Gets the patterns from the images and those patterns' weights and adjacencies.
 * Doesn't process images as periodic, and doesn't rotate or reflect patterns.
 * @param {number[][][]} images an array of 2D tile ID matrices each representing a layer of a tilemap
 * @param {number} N the width of the resulting square patterns
 * @returns {[number[][][], number[], Bitmask[][]]} patterns, weights, adjacencies
 */
export default function process(images, N) {
	const [patterns, weights] = getPatternsAndWeights(images, N);
	const adjacencies = getAdjacencies(patterns);
	return [patterns, weights, adjacencies];
}

/**
 * @param {number[][][]} images an array of 2D tile ID matrices each representing a layer of a tilemap
 * @param {number} N the width of the resulting square patterns
 */
function getPatternsAndWeights(images, N) {
	/*
		Because patterns[] must only contain unique ones, we have to get patterns and weights together
		When we find duplicate patterns, throw them out and increment the original pattern's weight
		Use a map to filter out duplicates and know the index of the element in weights[] to increment
	*/

	const patterns = [];
	const weights = [];
	const uniquePatterns = new Map();	// <pattern, index>
	
	for (const image of images) {
		for (let y = 0; y < image.length-N+1; y++) {	// length-N+1 because we're not processing image as periodic
		for (let x = 0; x < image[0].length-N+1; x++) {	// length-N+1 because we're not processing image as periodic

			const p = getPattern(image, N, y, x);
			const p_str = p.toString();	// need to convert to string because maps compare arrays using their pointers
			if (uniquePatterns.has(p_str)) {
				const i = uniquePatterns.get(p_str);
				weights[i]++;
			}
			else {
				patterns.push(p);
				weights.push(1);
				uniquePatterns.set(p_str, patterns.length-1);
			}
		}}
	}

	return [patterns, weights];
}

/**
 * @param {number[][]} image a 2D matrix of tile IDs representing a layer of a tilemap
 * @param {number} N the width of the resulting square patterns
 * @param {number} y the y position of the top left tile of the pattern in the image
 * @param {number} x the x position of the top left tile of the pattern in the image
 * @returns {number[][]}
 */
function getPattern(image, N, y, x) {
	const pattern = [];
	for (let ny = 0; ny < N; ny++) pattern[ny] = [];

	for (let ny = 0; ny < N; ny++) {
	for (let nx = 0; nx < N; nx++) {
		pattern[ny][nx] = image[y+ny][x+nx];
	}}

	return pattern;
}

/**
 * @param {number[][][]} patterns 
 * @returns {Bitmask[][]} adjacencies
 */
function getAdjacencies(patterns) {
	/*
		Check each pattern against every other pattern in every direction
		Because pattern adjacency is commutative (A is adjacent to B means B is adjacent to A)
		We don't need to check combos that we've already done
		Hence why j starts at i+1
	*/

	const adjacencies = [];
	for (let i = 0; i < patterns.length; i++) {
		adjacencies.push([
			new Bitmask(patterns.length),	// up
			new Bitmask(patterns.length),	// down
			new Bitmask(patterns.length),	// left
			new Bitmask(patterns.length)	// right
		]);
	}		

	const oppositeDirIndex = new Map([[0, 1], [1, 0], [2, 3], [3, 2]]);	// input direction index k to get opposite direction index o

	for (let i = 0; i < patterns.length; i++) {
		for (let j = i+1; j < patterns.length; j++) {
			for (let k = 0; k < DIRECTIONS.length; k++) {
				if (isAdjacent(patterns[i], patterns[j], DIRECTIONS[k])) {
					const o = oppositeDirIndex.get(k);
					adjacencies[i][k].setBit(j);
					adjacencies[j][o].setBit(i);
				}
			}
		}
	}

	return adjacencies;
}

/**
	 * Determines if p1 is to the {dir} of p2. The result also tells if p2 is to the {opposite dir} of p1.
	 * @param {number[][]} p1 pattern 1
	 * @param {number[][]} p2 pattern 2
	 * @param {number[]} dir direction
	 * @returns {boolean}
	 */
function isAdjacent(p1, p2, dir) {
	/*
		Check if the patterns overlap, for example:
		Suppose dir is UP ([-1, 0])

			p1
		X	X	X			p2
		1	2	3		1	2	3
		4	5	6		4	5	6
						X	X	X

		If every number in p1 matches with its corresponding number in p2, then p1 is to the top of p2
	*/

	const start = new Map([[-1, 1], [1, 0], [0, 0]]);
	const end = new Map([[-1, 0], [1, -1], [0, 0]]);
	const dy = dir[0];
	const dx = dir[1];
	const startY = start.get(dy);
	const startX = start.get(dx);
	const endY = p1.length + end.get(dy);
	const endX = p1[0].length + end.get(dx);

	for (let y = startY; y < endY; y++) {
	for (let x = startX; x < endX; x++) {
		const tile1 = p1[y][x];
		const tile2 = p2[y+dy][x+dx];	// apply offsets
		if (tile1 !== tile2) return false;
	}}
	return true;
}