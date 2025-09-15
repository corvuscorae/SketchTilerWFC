// hierarchicalWFC.js
import WFCModel from "./wfcModel.js";

export default class HierarchicalWFC {
  /**
   * Stores WFCModel instances for each level of the hierarchy.
   * @type {Object.<string, WFCModel>}
   */
  levelModels = {};

  /**
   * The configuration for each level.
   * @type {Object.<string, { inputImages: any[], N: number, tileSize: number }>}
   */
  levelConfigs = {};

  /**
   * Initializes the hierarchical model with configurations for each level.
   * @param {Object.<string, { inputImages: any[], N: number, tileSize: number }>} configs
   */
  constructor(configs) {
    this.levelConfigs = configs;
    for (const levelName in configs) {
      this.levelModels[levelName] = new WFCModel();
      // The `learn` step will be done separately
    }
  }

  /**
   * Learns patterns for all levels based on their configurations.
   */
  learn() {
    for (const levelName in this.levelConfigs) {
      const config = this.levelConfigs[levelName];
      this.levelModels[levelName].learn(config.inputImages, config.N);
    }
  }

  /**
   * Generates a hierarchical image.
   * @param {number} topLevelWidth
   * @param {number} topLevelHeight
   * @returns {TilemapImage | null}
   */
  generate(topLevelWidth, topLevelHeight) {
    // Generate the top-level grid
    const topLevelModel = this.levelModels['top'];
    const topLevelGrid = topLevelModel.generate(topLevelWidth, topLevelHeight);

    if (!topLevelGrid) {
      return null; // Top-level generation failed
    }

    // Determine the size of the final image
    const bottomLevelConfig = this.levelConfigs['bottom'];
    const finalImageWidth = topLevelWidth * bottomLevelConfig.tileSize;
    const finalImageHeight = topLevelHeight * bottomLevelConfig.tileSize;
    const finalImage = Array.from({ length: finalImageHeight }, () => Array(finalImageWidth).fill(0));

    // Iterate the top-level grid and generate sub-grids
    const bottomLevelModel = this.levelModels['bottom'];
    for (let y = 0; y < topLevelHeight; y++) {
      for (let x = 0; x < topLevelWidth; x++) {
        const topLevelTileID = topLevelGrid[y][x];

        // Based on the top-level tile, set initial constraints on the sub-grid
        // This is a crucial step for continuity (and can be complex)
        // You'll need a mapping from top-level tile IDs to specific sub-grid patterns.
        bottomLevelModel.clearSetTiles();
        // Here you would add setTile instructions to the bottomLevelModel based on `topLevelTileID`
        // For example: set a specific pattern at the center or edges.

        const subGrid = bottomLevelModel.generate(
          bottomLevelConfig.tileSize, 
          bottomLevelConfig.tileSize
        );
        
        if (!subGrid) {
            console.error(`Sub-grid generation failed for tile at (${x}, ${y})`);
            return null;
        }

        // Place the generated sub-grid into the final image
        for (let subY = 0; subY < bottomLevelConfig.tileSize; subY++) {
          for (let subX = 0; subX < bottomLevelConfig.tileSize; subX++) {
            finalImage[y * bottomLevelConfig.tileSize + subY][x * bottomLevelConfig.tileSize + subX] = subGrid[subY][subX];
          }
        }
      }
    }

    return finalImage;
  }
}