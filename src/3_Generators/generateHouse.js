import WFCModel from "../2_WFC/1_Model/WFCModel.js";
import IMAGES from "../2_WFC/2_Input/IMAGES.js";

const model = new WFCModel().learn(IMAGES.HOUSES, 2);

/**
 * @param {BoundingBox} boundingBox
 * @returns {TilemapImage}
 */
export default function generateHouse(boundingBox) {
  model.clearSetTiles();
  model.setTile(0, 0, 53)	// orange roof TL corner
  model.setTile(0, boundingBox.height - 1, 77); // blue house BL corner
  const house = model.generate(boundingBox.width, boundingBox.height, 10, false, false);
  if (!house) throw new Error("Contradiction created");
  return house;
}