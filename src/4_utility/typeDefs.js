/*
	Create global type definitions to be used by other project files here
	These typedefs simply exist to improve code readability and editor support, especially for JSDoc comments

	The "include" directive in jsconfig.json ensures that this file is always loaded by VS Code, even if it’s not open
	That way, these typedefs will always be known by IntelliSense
*/

// Imports (for the following typedefs to use)
/** @typedef {import("../2_wfc/2_components/bitmask.js").default} Bitmask */

// WFC
/**
 * @typedef {number[]} Direction An array of two numbers. The first stores y and the second stores x. Positive y points down while positive x points right.
 * 
 * @typedef {number[][]} TilemapImage A 2D matrix of tile IDs that represents a layer of a tilemap.
 * 
 * @typedef {number[][]} Pattern An 2D NxN matrix of tile IDs.
 *
 * @typedef {Bitmask} AdjacentPatternsBitmask Given a pattern A, stores which patterns are adjacent to A in a single direction.
 * @typedef {AdjacentPatternsBitmask[]} AdjacentPatternsMap An array of four AdjacentPatternsBitmasks. Given a pattern A, stores which patterns are adjacent to A in each of the four directions.
 * @typedef {Bitmask} PossiblePatternsBitmask Stores which patterns a cell can become.
 * 
 * @typedef {PossiblePatternsBitmask} Cell Currently the only info a cell needs to contain is its PossiblePatternsBitmask so for simplicity it is just that instead of an object containing it.
 */