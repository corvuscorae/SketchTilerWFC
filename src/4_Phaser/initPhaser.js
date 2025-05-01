import Phaser from "../../lib/PhaserModule.js";
import Autotiler from "./Autotiler.js";

export default function initPhaser() {
  window.game = new Phaser.Game({
    parent: "phaser",
    type: Phaser.CANVAS,
    width: 640,		// 40 tiles x 16 pixels each
    height: 400,	// 25 tiles x 16 pixels each
    zoom: 1,
    //autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,	// comment out this line to not center
    backgroundColor: "rgb(143, 143, 143)",
    render: { pixelArt: true },	// scale pixel art without blurring
    scene: [Autotiler]
  });
}