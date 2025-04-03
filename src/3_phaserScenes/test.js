import Phaser from "../../lib/phaser.module.js"
import WFC from "../2_wfc/wfc.js";
import { MAPS_GROUND, MAPS_STRUCTURES } from "../2_wfc/1_input/maps.js";

export default class Test_Scene extends Phaser.Scene {

	constructor() {
		super("tinyTownGeneratorScene");
	}

	preload() {
		this.load.setPath("./assets/");
		this.load.image("tilemap", "tinyTown_Tilemap_Packed.png");
		this.load.tilemapTiledJSON("tinyTownMap", `map${this.mapIndex}.tmj`);
	}

	create()
	{
		const image = [
			[1, 2, 3, 4, 5],
			[6, 7, 8, 9, 10],
			[11, 12, 13, 14, 15],
			[16, 17, 18, 19, 20],
			[21, 22, 23, 24, 25]
		];

		const wfc = new WFC();
		
		wfc.process(MAPS_GROUND, 2);
		const map = wfc.generate(10, 10, 10);
		console.log(map);
	}
}