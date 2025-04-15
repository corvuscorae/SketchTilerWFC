import MAP1 from "./1_input/map1.js";
import MAP2 from "./1_input/map2.js";
import MAP3 from "./1_input/map3.js";
import MAP4 from "./1_input/map4.js";

/** @type {{ GROUND: InputImage[], STRUCTURES: InputImage[] }} */
const IMAGES = {
	GROUND: [
		MAP1.GROUND,
		//MAP2.GROUND,
		//MAP3.GROUND,
		//MAP4.GROUND
	],
	STRUCTURES: [
		//MAP1.STRUCTURES,
		//MAP2.STRUCTURES,
		MAP3.STRUCTURES,
		//MAP4.STRUCTURES
	]
};
export default IMAGES;