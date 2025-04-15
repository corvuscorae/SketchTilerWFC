import Phaser from "../../lib/phaserModule.js"
import WFCModel from "../2_wfc/wfcModel.js";
import IMAGES from "../2_wfc/images.js"

export default class WFCTesting extends Phaser.Scene {
	displayedMapID = 3;	// check assets folder to see all maps

	model = new WFCModel();
	N = 2;
	width = 24;
	height = 15;
	maxAttempts = 10;
	logProgress = true;
	profileLearning = false;
	profileSolving = true;

	numRuns = 10;	// for this.getAverageGenerationDuration()

	constructor() {
		super("wfcTestingScene");
	}

	preload() {
		this.load.setPath("./assets/");
		this.load.image("tilemap", "tinyTown_Tilemap_Packed.png");
		this.load.tilemapTiledJSON("tinyTownMap", `map${this.displayedMapID}.tmj`);
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
		}
		else {
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

		document.getElementById("descriptionText").innerHTML = `
			<h2>Controls</h2>
			(Opening the console is recommended) <br><br>
			Generate: G <br>
			Clear generation: C <br>
			Get average generation duration over ${this.numRuns} runs: A
		`;
	}

	generateMap(){
		console.log("Using model for ground");
		this.model.learn(IMAGES.GROUND, this.N, this.profileLearning);
		const groundImage = this.model.generate(this.width, this.height, this.maxAttempts, this.logProgress, this.profileSolving);
		if (!groundImage) return;

		console.log("Using model for structures");
		this.model.learn(IMAGES.STRUCTURES, this.N, this.profileLearning);
		const structuresImage = this.model.generate(this.width, this.height, this.maxAttempts, this.logProgress, this.profileSolving);
		if (!structuresImage) return;

		this.displayMap(groundImage, structuresImage);
	}

	/**
	 * @param {number[][]} groundImage 
	 * @param {number[][]} structuresImage 
	 */
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
		for (let i = 1; i <= numRuns; i++) {	// we want i to start at one for console logging
			const start = performance.now();
			this.generateMap();
			let duration = performance.now() - start;
			totalDuration += duration;
			console.log(`Generation #${i} took ${duration.toFixed(2)} ms`)
		}
		console.log(`Generating ${numRuns} times took ${totalDuration} ms, with an average duration of ${(totalDuration / numRuns).toFixed(2)} ms`)
	}
}
