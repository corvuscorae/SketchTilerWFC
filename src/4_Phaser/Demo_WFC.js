import Phaser from "../../lib/phaserModule.js";
import WFCModel from "../2_WFC/1_Model/wfcModel.js";
import IMAGES from "../2_WFC/2_Input/images.js";
import generateHouse from "../3_Generators/generateHouse.js";

// hide sketchpad elements
document.getElementById("sketchpad").classList.add("hidden");
document.getElementById("buttons").classList.add("hidden");
document.getElementById("instructions").classList.add("hidden");

export default class Demo_WFC extends Phaser.Scene {
  displayedMapID = 3;	// check assets folder to see all maps  

  N = 2;
  profileLearning = false;

  // width & height for entire maps should have an 8:5 ratio (e.g. 24x15, 40x25)
  width = 40;
  height = 25;
  maxAttempts = 10;
  logProgress = true;
  profileSolving = true;
  logProfile = false;

  numRuns = 100;	// for this.getAverageGenerationDuration()
  printAveragePerformance = true;

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
    this.timedRuns_Key.on("down", () => this.getAverageGenerationDuration(this.numRuns, this.printAveragePerformance));

    const phaser = document.getElementById("phaser");
    const instructions = document.createElement("section");
    instructions.innerHTML = `
      <h2>Controls</h2>
      <p>
        (Opening the console is recommended) <br><br>
        Generate: G <br>
        Clear generation: C <br>
        Get average generation duration over ${this.numRuns} runs: A
      </p>
    `;
    phaser.append(instructions);
  }

  generateMap(profile = false){
    console.log("Using model for ground");
    const groundImage = this.groundModel.generate(this.width, this.height, this.maxAttempts, this.logProgress, this.profileSolving, this.logProfile);
    if (!groundImage) return;

    console.log("Using model for structures");
    const structuresImage = this.structuresModel.generate(this.width, this.height, this.maxAttempts, this.logProgress, this.profileSolving, this.logProfile);
    if (!structuresImage) return;
    
    /*
    console.log("Using house generator");
    const structuresImage = generateHouse({
      topLeft: { x: 0, y: 0 },
      bottomRight: { x: this.width-1, y: this.height-1 },
      width: this.width,
      height: this.height
    });
    if (!structuresImage) return;
    */

    this.displayMap(groundImage, structuresImage);

    // return performance profiles for models used
    if(profile){
      return {
        ground: this.groundModel.performanceProfile,
        structs: this.structuresModel.performanceProfile,
      }
    }
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

  getAverageGenerationDuration(numRuns, print) {
    let profiles = [];
    for (let i = 0; i < numRuns; i++) {
      profiles.push(this.generateMap(true));
    }

    let avg = this.sumAllProfiles(profiles);

    for (const [modelName, modelProfile] of Object.entries(avg)) {
      for (const [funcName, functionPerformance] of Object.entries(modelProfile)) {
        avg[modelName][funcName] = avg[modelName][funcName] / numRuns;  
      }
    }

    if(print) console.log(this.printAverages(avg, numRuns));
    console.log(avg);
  }

  sumAllProfiles(profiles) {
    let sum = {};
    for(let profile of profiles){
      for (const [modelName, modelProfile] of Object.entries(profile)) {
        if(!sum[modelName]) sum[modelName] = {};
        for (const [funcName, functionPerformance] of Object.entries(modelProfile)) {
          let runningTotal = sum[modelName][funcName] ?? 0;
          runningTotal += functionPerformance;
          sum[modelName][funcName] = runningTotal;
        }
      }
    }

    return sum;
  }

  printAverages(averages, numRuns){
    let message = `==========================================\n`;
    message += `Average performance over ${numRuns} runs:\n`;
    for (const [modelName, modelProfile] of Object.entries(averages)) {
      message += `\n=== ${modelName.toUpperCase()} MODEL ===\n`;
      for (const [funcName, functionPerformance] of Object.entries(modelProfile)) {
        let val = averages[modelName][funcName];  
        message += `${funcName}: ${val} ms\n`;
      }
    }
    message += `\n==========================================`;
    return message;
  }

}
