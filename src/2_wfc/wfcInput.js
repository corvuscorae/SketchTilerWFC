import { MAP1_GROUND, MAP1_STRUCTURES } from "./1_input/map1.js";
import { MAP2_GROUND, MAP2_STRUCTURES } from "./1_input/map2.js";
import { MAP3_GROUND, MAP3_STRUCTURES } from "./1_input/map3.js";
import { MAP4_GROUND, MAP4_STRUCTURES } from "./1_input/map4.js";

/**
 * @type {{ GROUND: LayerImage[], STRUCTURES: LayerImage[] }}
 * @description A collection of image data for rendering maps.
 * - `GROUND`: An array of ground image grids
 * - `STRUCTURES`: An array of structure image grids
 */
const IMAGES = {
	GROUND: [
		MAP1_GROUND,
		//MAP2_GROUND,
		//MAP3_GROUND,
		//MAP4_GROUND
	],
	STRUCTURES: [
		//MAP1_STRUCTURES,
		//MAP2_STRUCTURES,
		MAP3_STRUCTURES,
		//MAP4_STRUCTURES
	]
};

export default IMAGES;