import Phaser from "../../lib/PhaserModule.js";
import WFCModel from "../2_WFC/1_Model/WFCModel.js";
import IMAGES from "../2_WFC/2_Input/IMAGES.js";
import generateHouse from "../3_Generators/generateHouse.js";

export default class Demo_WFC extends Phaser.Scene {
  displayedMapID = 3;	// check assets folder to see all maps  

  N = 2;
  profileLearning = false;

  // width & height for entire maps should have an 8:5 ratio (e.g. 24x15, 40x25)
  width = 3;
  height = 3;
  maxAttempts = 10;
  logProgress = true;
  profileSolving = false;

  numRuns = 10;	// for this.getAverageGenerationDuration()

  groundModel = new WFCModel().learn(IMAGES.GROUND, this.N, this.profileLearning);
  structuresModel = new WFCModel().learn(IMAGES.STRUCTURES, this.N, this.profileLearning);

  constructor() {
    super("wfcTestingScene");
  }

  preload() {
    this.load.setPath("./assets/");
    this.load.image("tilemap", "tinyTown_Tilemap_Packed.png");
    this.load.tilemapTiledJSON("tinyTownMap", `maps/map${this.displayedMapID}.tmj`);
  }

  create() {
    this.showInputImage();
    this.setupControls();

    /*
    const housesModel = new WFCModel().learn(IMAGES.HOUSES, this.N, this.profileLearning);
    const patternsData = [[], [], [], []];
    for (let i = 0; i < housesModel.imageLearner.patterns.length; i++) {
      const pattern = housesModel.imageLearner.patterns[i];

      for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        patternsData[y].push(pattern[y][x]);
      }}

      patternsData[0].push(0);
      patternsData[1].push(0);
    }
    const tilemap = this.make.tilemap({
      data: patternsData,
      tileWidth: 16,
      tileHeight: 16
    });
    const multiLayerMap = this.add.tilemap("tinyTownMap", 16, 16, 40, 25);
    this.tileset = multiLayerMap.addTilesetImage("kenney-tiny-town", "tilemap");
    tilemap.createLayer(0, this.tileset, 0, 300);
    */
  }

  showInputImage() {
    this.multiLayerMap = this.add.tilemap("tinyTownMap", 16, 16, 40, 25);
    this.tileset = this.multiLayerMap.addTilesetImage("kenney-tiny-town", "tilemap");

    if (this.displayedMapID === 1) {
      this.groundLayer = this.multiLayerMap.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
      this.treesLayer = this.multiLayerMap.createLayer("Trees-n-Bushes", this.tileset, 0, 0);
      this.housesLayer = this.multiLayerMap.createLayer("Houses-n-Fences", this.tileset, 0, 0);
      this.multiLayerMapLayers = [this.groundLayer, this.treesLayer, this.housesLayer];
    } else {
      this.groundLayer = this.multiLayerMap.createLayer("Ground", this.tileset, 0, 0);
      this.structuresLayer = this.multiLayerMap.createLayer("Structures", this.tileset, 0, 0);
      this.multiLayerMapLayers = [this.groundLayer, this.structuresLayer];
    }
  }

  setupControls() {
    this.runWFC_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    this.clear_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.timedRuns_Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

    this.runWFC_Key.on("down", () => this.generateMap());
    this.clear_Key.on("down", () => {
      for (const layer of this.multiLayerMapLayers) layer.setVisible(true);
      if (this.groundMap) this.groundMap.destroy();
      if (this.structuresMap) this.structuresMap.destroy();
    });
    this.timedRuns_Key.on("down", () => this.getAverageGenerationDuration(this.numRuns));

    document.getElementById("instructions").innerHTML = `
      <h2>Controls</h2>
      (Opening the console is recommended) <br><br>
      Generate: G <br>
      Clear generation: C <br>
      Get average generation duration over ${this.numRuns} runs: A
    `;
  }

  generateMap(){
    console.log("Using model for ground");
    const groundImage = this.groundModel.generate(this.width, this.height, this.maxAttempts, this.logProgress, this.profileSolving);
    if (!groundImage) return;

    /*
    console.log("Using model for structures");
    const structuresImage = this.structuresModel.generate(this.width, this.height, this.maxAttempts, this.logProgress, this.profileSolving);
    if (!structuresImage) return;
    */

    console.log("Using house generator");
    const structuresImage = generateHouse({
      topLeft: { x: 0, y: 0 },
      bottomRight: { x: this.width-1, y: this.height-1 },
      width: this.width,
      height: this.height
    });
    if (!structuresImage) return;

    this.displayMap(groundImage, structuresImage);

    this.width++;
    this.height++;
  }

  displayMap(groundImage, structuresImage) {
    if (this.groundMap) this.groundMap.destroy();
    if (this.structuresMap) this.structuresMap.destroy();

    this.groundMap = this.make.tilemap({
      data: groundImage,
      tileWidth: 16,
      tileHeight: 16
    });
    this.structuresMap = this.make.tilemap({
      data: structuresImage,
      tileWidth: 16,
      tileHeight: 16
    });
    
    this.groundMap.createLayer(0, this.tileset, 0, 0);
    this.structuresMap.createLayer(0, this.tileset, 0, 0);

    for (const layer of this.multiLayerMapLayers) layer.setVisible(false);
  }	

  getAverageGenerationDuration(numRuns) {
    let totalDuration = 0;
    for (let i = 1; i <= numRuns; i++) {  // we want i to start at one for console logging
      const start = performance.now();
      this.generateMap();
      let duration = performance.now() - start;
      totalDuration += duration;
      console.log(`Generation #${i} took ${duration.toFixed(2)} ms`)
    }
    console.log(`Generating ${numRuns} times took ${totalDuration} ms, with an average duration of ${(totalDuration / numRuns).toFixed(2)} ms`)
  }
}
