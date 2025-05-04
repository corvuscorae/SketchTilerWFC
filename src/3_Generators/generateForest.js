import WFCModel from "../2_WFC/1_Model/wfcModel.js";
import IMAGES from "../2_WFC/2_Input/images.js";

const model = new WFCModel().learn(IMAGES.FORESTS, 2);

/**
 * @param {BoundingBox} boundingBox
 * @returns {TilemapImage}
 */
export default function generateForest(boundingBox) {
  model.clearSetTiles();
  return model.generate(boundingBox.width, boundingBox.height, 10, false, false);
}