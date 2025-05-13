import WFCModel from "../2_WFC/1_Model/WFCModel.js";
import IMAGES from "../2_WFC/2_Input/IMAGES.js";
import TILEMAP from "../4_Phaser/TILEMAP.js";

const model = new WFCModel().learn(IMAGES.HOUSES, 2);

/**
 * @param {BoundingBox} boundingBox
 * @returns {TilemapImage}
 */
export default function generateHouse(boundingBox) {
  const {width, height} = boundingBox;

  model.clearSetTiles();  

  model.setTile(0, 0, [TILEMAP.HOUSE_TOP_LEFT_TILES[0]]);
  model.setTile(width-1, 0, [TILEMAP.HOUSE_TOP_RIGHT_TILES[0]]);
  model.setTile(0, height-1, [TILEMAP.HOUSE_BOTTOM_LEFT_TILES[0]]);
  model.setTile(width-1, height-1, [TILEMAP.HOUSE_BOTTOM_RIGHT_TILES[0]]);

  /*
  const x = randIntInRange(1, width-1);
  if (width <= 3) {
    model.setTile(x, height-1, TILEMAP.HOUSE_DOOR_TILES);
  } else {
    if (x == width-2) {
      model.setTile(x, height-1, [...TILEMAP.HOUSE_DOOR_TILES, ...TILEMAP.HOUSE_DOUBLE_DOOR_RIGHT_TILES]);
    }
    else {
      model.setTile(x, height-1, [...TILEMAP.HOUSE_DOOR_TILES, ...TILEMAP.HOUSE_DOUBLE_DOOR_LEFT_TILES, ...TILEMAP.HOUSE_DOUBLE_DOOR_RIGHT_TILES]);
    }
  }
  */

  const house = model.generate(width, height, 10, false, false);
  if (!house) throw new Error("Contradiction created");
  return house;
}

/**
 * Returns a random integer in the range [min, max). 
 * @param {number} min Must be an integer.
 * @param {number} max Must be an integer.
 * @returns {number}
*/
function randIntInRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}