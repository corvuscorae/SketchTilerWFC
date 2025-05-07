import WFCModel from "../2_WFC/1_Model/WFCModel.js";
import IMAGES from "../2_WFC/2_Input/IMAGES.js";

const model = new WFCModel().learn(IMAGES.HOUSES, 2);

/**
 * @param {BoundingBox} boundingBox
 * @returns {TilemapImage}
 */
export default function generateHouse(boundingBox) {
  model.clearSetTiles();

  model.setTile(0, boundingBox.height-1, 73);	// brown house BL corner
  model.setTile(boundingBox.width-1, boundingBox.height-1, 76)	// brown house BR corner

  //model.setTile(0, boundingBox.height-1, 77);	// blue house BL corner
  //model.setTile(boundingBox.width-1, boundingBox.height-1, 80)	// blue house BR corner

  model.setTile(0, 0, 49)	// blue roof TL corner
  //model.setTile(boundingBox.width-1, 0, 51)	// blue roof TR corner
  //model.setTile(boundingBox.width-1, 0, 52)	// blue roof TR chimney

  //model.setTile(0, 0, 53)	// orange roof TL corner
  //model.setTile(boundingBox.width-1, 0, 55)	// orange roof TR corner
  //model.setTile(boundingBox.width-1, 0, 56)	// orange roof TRchimney

  const house = model.generate(boundingBox.width, boundingBox.height, 10, false, false);
  if (!house) throw new Error("Contradiction created");
  return house;
}