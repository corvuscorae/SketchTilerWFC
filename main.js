"use strict"	// execute JS code in strict mode
import Phaser from "./lib/phaser.module.js";
import SketchDemo_Scene from "./src/3_phaserScenes/SketchDemo.js";

const config = {
	parent: "phaserCanvas",
	type: Phaser.CANVAS,
	width: 640,		// 40 tiles x 16 pixels each
	height: 400,	// 25 tiles x 16 pixels each
	zoom: 1,
	autoCenter: true,
	backgroundColor: "rgb(143, 143, 143)",
	render: { pixelArt: true },	// scale pixel art without blurring
	scene: [SketchDemo_Scene]
}

window.game = new Phaser.Game(config);