"use strict"	// execute JS code in strict mode

import Phaser from "./lib/PhaserModule.js";
import Demo_Sketch from "./src/4_PhaserScenes/Demo_Sketch.js";

const config = {
	parent: "phaser",
	type: Phaser.CANVAS,
	width: 640,		// 40 tiles x 16 pixels each
	height: 400,	// 25 tiles x 16 pixels each
	zoom: 1,
	//autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,	// comment out this line to not center
	backgroundColor: "rgb(143, 143, 143)",
	render: { pixelArt: true },	// scale pixel art without blurring
	scene: [Demo_Sketch]
}

window.game = new Phaser.Game(config);