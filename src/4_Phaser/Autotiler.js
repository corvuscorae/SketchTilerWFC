import Phaser from "../../lib/PhaserModule.js";
import TILEMAP from "./tilemap.js";
import getBoundingBox from "../3_Generators/getBoundingBox.js";
import generateHouse from "../3_Generators/generateHouse.js";

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

    window.addEventListener("generate", (e) => {
      const tilemapData = [];
      for (let y = 0; y < TILEMAP.HEIGHT; y++) {
        tilemapData[y] = [];
        for (let x = 0; x < TILEMAP.WIDTH; x++) {
          tilemapData[y][x] = -1;
        }
      }

      for (const structure of Object.values(e.detail)) {
        if (!structure.strokes) continue;
        if (structure.strokes.length < 1) continue;
        if (structure.info.type.toLowerCase() != "house") continue;

        for (const stroke of structure.strokes) {
          const boundingBox = getBoundingBox(stroke);
          const house = generateHouse(boundingBox);
          for (let y = 0; y < boundingBox.height; y++) {
          for (let x = 0; x < boundingBox.width; x++) {
            const dy = y + boundingBox.topLeft.y;
            const dx = x + boundingBox.topLeft.x;
            tilemapData[dy][dx] = house[y][x];
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
