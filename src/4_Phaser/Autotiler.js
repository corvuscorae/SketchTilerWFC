import Phaser from "../../lib/PhaserModule.js";
import TILEMAP from "./tilemap.js";
import WFCModel from "../2_WFC/1_Model/wfcModel.js";
import IMAGES from "../2_WFC/2_Input/images.js";

export default class Autotiler extends Phaser.Scene {
  constructor() {
    super("autotilerScene");
  }

  preload() {
    this.load.setPath("./assets/");
    this.load.image("tilemap", "tinyTown_Tilemap_Packed.png");
    this.load.tilemapTiledJSON("tinyTownMap", `maps/map1.tmj`);
  }

  create() {
    this.multiLayerMap = this.add.tilemap("tinyTownMap", 16, 16, 40, 25);
    this.tileset = this.multiLayerMap.addTilesetImage("kenney-tiny-town", "tilemap");

    const houseModel = new WFCModel().learn(IMAGES.HOUSES, 2);

    window.addEventListener("generate", (e) => {
      const details = e.detail;

      const tilemapData = [];
      for (let y = 0; y < TILEMAP.HEIGHT; y++) {
        tilemapData[y] = [];
        for (let x = 0; x < TILEMAP.WIDTH; x++) {
          tilemapData[y][x] = -1;
        }
      }

      for (const structure of Object.values(details)) {
        if (!structure.strokes) continue;
        if (structure.strokes.length < 1) continue;
        if (structure.info.type.toLowerCase() != "house") continue;

        for (const strokes of structure.strokes) {
          let [minX, minY] = [Infinity, Infinity];
          let [maxX, maxY] = [-1, -1];

          for (const stroke of strokes) {
            const [x, y] = [stroke.x, stroke.y];

            if (x < minX) minX = x;
            else if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            else if (y > maxY) maxY = y;
          }

          const topLeft = [Math.floor(minX / TILEMAP.TILE_WIDTH), Math.floor(minY / TILEMAP.TILE_WIDTH)];
          const bottomRight = [Math.floor(maxX / TILEMAP.TILE_WIDTH), Math.floor(maxY / TILEMAP.TILE_WIDTH)];
        
          const width = bottomRight[0] - topLeft[0] + 1;
          const height = bottomRight[1] - topLeft[1] + 1;

          houseModel.clearSetTiles();
          houseModel.setTile(0, height-1, 77); // blue BL corner
          houseModel.setTile(0, 0, 53)	// orange roof TL corner
          const image = houseModel.generate(width, height, 10, false, false);

          for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const dy = y + topLeft[1];
            const dx = x + topLeft[0];
            tilemapData[dy][dx] = image[y][x];
          }}
        }
      }

      if (this.tilemap) this.tilemap.destroy();
      this.tilemap = this.make.tilemap({
        data: tilemapData,
        tileWidth: TILEMAP.TILE_WIDTH,
        tileHeight: TILEMAP.TILE_WIDTH
      });
      this.tilemap.createLayer(0, this.tileset, 0, 0);
    });
  }
}
