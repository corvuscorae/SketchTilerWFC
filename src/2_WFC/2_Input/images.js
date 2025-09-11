import MAP1 from "./MAP1.js";
import MAP2 from "./MAP2.js";
import MAP3 from "./MAP3.js";
import MAP4 from "./MAP4.js";
import MAP5 from "./MAP5.js";
import MAP6 from "./MAP6.js";
import MAP7 from "./MAP7.js";
import MAP8 from "./MAP8.js";
import HOUSES from "./HOUSES.js";

/** @type {{ GROUND: TilemapImage[], STRUCTURES: TilemapImage[], HOUSES: TilemapImage[], FORESTS: TilemapImage[] }} */
const IMAGES = {
  GROUND: [
    MAP1.GROUND,
    MAP2.GROUND,
    MAP3.GROUND,
    //MAP4.GROUND
    MAP5.GROUND,
    MAP6.GROUND,
    MAP7.GROUND,
    MAP8.GROUND

  ],
  STRUCTURES: [
    MAP1.STRUCTURES,
    MAP2.STRUCTURES,
    MAP3.STRUCTURES,
    //MAP4.STRUCTURES
    MAP5.STRUCTURES,
    MAP6.STRUCTURES,
    MAP7.STRUCTURES,
    MAP8.STRUCTURES,
  ],
  HOUSES: HOUSES,
  FORESTS: [
    ...MAP1.FORESTS
  ]
};
export default IMAGES;