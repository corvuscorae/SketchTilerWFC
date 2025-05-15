import Phaser from "../../lib/PhaserModule.js";
import WFCModel from "../2_WFC/1_Model/wfcModel.js";
import IMAGES from "../2_WFC/2_Input/images.js";
import TILEMAP from "./TILEMAP.js";
import getBoundingBox from "../3_Generators/getBoundingBox.js";
import generateHouse from "../3_Generators/generateHouse.js";
import generateForest from "../3_Generators/generateForest.js";
import { Regions } from "../1_Sketchpad/strokeToTiles.js";

const SUGGESTED_TILE_ALPHA = 0.5;  // must be between 0 and 1

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

    this.groundModel = new WFCModel().learn(IMAGES.GROUND, 2);
    this.structsModel = new WFCModel().learn([...IMAGES.STRUCTURES, ...IMAGES.HOUSES], 2);
    /*
    window.addEventListener("generate", (e) => {
      const sketchImage = Array.from({ length: TILEMAP.HEIGHT }, () => Array(TILEMAP.WIDTH).fill(0));  // 2D array of all 0s

      this.structsModel.clearSetTiles();

      for (const structure of Object.values(e.detail)) {
        if (!structure.strokes) continue;
        if (structure.strokes.length < 1) continue;

        if (structure.info.region === "box") {
          for (const stroke of structure.strokes) {
            const boundingBox = getBoundingBox(stroke);
            const struct = structure.info.type === "House" ? generateHouse(boundingBox) : generateForest(boundingBox);
            for (let y = 0; y < boundingBox.height; y++) {
            for (let x = 0; x < boundingBox.width; x++) {
              const dy = y + boundingBox.topLeft.y;
              const dx = x + boundingBox.topLeft.x;
              sketchImage[dy][dx] = struct[y][x];
              this.structsModel.setTile(dx, dy, [struct[y][x]]);
            }}
          }
        } else {
          for (const stroke of structure.strokes) {
            if (structure.info.type === "Fence") console.log("Fence generation not implemented yet");
            else console.log("Path generation not implemented yet");
          }
        }
      }

    });
    */

    this.generator = {
      House: (region) => generateHouse({width: region.width, height: region.height}),
      Path: (region) => console.log("TODO: link path generator", region),
      Fence: (region) => console.log("TODO: link fence generator", region),
      Forest: (region) => generateForest({width: region.width, height: region.height})
    };

    window.addEventListener("generate", (e) => {
      this.structures = e.detail;
      const regions = new Regions(this.structures, 16).get();
      const sketchImage = Array.from({ length: TILEMAP.HEIGHT }, () => Array(TILEMAP.WIDTH).fill(0));  // 2D array of all 0s
      
      this.generate(regions, sketchImage);
      
      this.createGroundMap()
      this.createStructsMap_WFC();
      this.createStructsMap_Sketch(sketchImage);

      console.log("Generation Complete");
    });

    window.addEventListener("clearSketch", (e) => {
      this.groundModel.clearSetTiles();
      this.structsModel.clearSetTiles();
    });
  }

  // calls generators
  generate(regions, sketchImage) {
    const result = [];
    for (let structType in regions) {
      for (let region of regions[structType]) {
        const gen = this.generator[structType](region);

        if(this.structures[structType].info.region === "box"){
          for (let y = 0; y < region.height; y++) {
            for (let x = 0; x < region.width; x++) {
              const dy = y + region.topLeft.y;
              const dx = x + region.topLeft.x;
              sketchImage[dy][dx] = gen[y][x];
              this.structsModel.setTile(dx, dy, [gen[y][x]]);
            }
          }
        }

        if(this.structures[structType].info.region === "trace"){
          // TODO: implement trace region placements
        }

      }
    }
    return result;
  }

  createGroundMap() {
      const image = this.groundModel.generate(TILEMAP.WIDTH, TILEMAP.HEIGHT, 10, false, false);
      if (!image) throw new Error("Contradiction created");
      
      if (this.groundMap) this.groundMap.destroy();
      this.groundMap = this.make.tilemap({
        data: image,
        tileWidth: TILEMAP.TILE_WIDTH,
        tileHeight: TILEMAP.TILE_WIDTH
      });
      this.groundMap.createLayer(0, this.tileset, 0, 0);
  }

  createStructsMap_WFC() {
    const image = this.structsModel.generate(TILEMAP.WIDTH, TILEMAP.HEIGHT, 10, true, true);
    if (!image) throw new Error ("Contradiction created");

    if (this.structsMap_WFC) this.structsMap_WFC.destroy();
    this.structsMap_WFC = this.make.tilemap({
      data: image,
      tileWidth: TILEMAP.TILE_WIDTH,
      tileHeight: TILEMAP.TILE_WIDTH
    });
    this.structsMap_WFC.createLayer(0, this.tileset, 0, 0).setAlpha(SUGGESTED_TILE_ALPHA);
  }

  createStructsMap_Sketch(data) {
    if (this.structsMap_Sketch) this.structsMap_Sketch.destroy();
    this.structsMap_Sketch = this.make.tilemap({
      data: data,
      tileWidth: TILEMAP.TILE_WIDTH,
      tileHeight: TILEMAP.TILE_WIDTH
    });
    this.structsMap_Sketch.createLayer(0, this.tileset, 0, 0);
  }
}