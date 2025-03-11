import Phaser from "./lib/phaser.module.js";
import { TinyTownGenerator } from "./src/3_main/tinyTownGenerator.js";

"use strict"	// execute JS code in strict mode

let config = {
	parent: "phaserCanvas",
	type: Phaser.CANVAS,
	width: 640,
	height: 400,
	zoom: 1,
	autoCenter: true,
	render: { pixelArt: true },	// scale pixel art without blurring
	scene: [TinyTownGenerator]
}

window.game = new Phaser.Game(config);