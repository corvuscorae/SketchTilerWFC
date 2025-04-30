const sketchpad = document.getElementById("sketchpad");
sketchpad.style.width = window.game.config.width;
sketchpad.style.height = window.game.config.height;
//sketchpad.style.position = "relative";

const gridCanvas = document.getElementById("grid-canvas");
gridCanvas.width = window.game.config.width;
gridCanvas.height = window.game.config.height;
//gridCanvas.style.position = "absolute";
drawGrid();

const sketchCanvas = document.getElementById("sketch-canvas");
sketchCanvas.width = window.game.config.width;
sketchCanvas.height = window.game.config.height;
//sketchCanvas.style.position = "absolute";
//sketchCanvas.style.cursor = "none";
//const ctx = sketchCanvas.getContext("2d");
//ctx.font = "30px serif";

// TODO: make grid togglable+
function drawGrid() {
	const cellSize = 16;
	const color = "#DBDBDB";

	const width = gridCanvas.width;
	const height = gridCanvas.height;
	const ctx = gridCanvas.getContext('2d');
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;

	for (let x = 0; x <= width; x += cellSize) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, height);
		ctx.stroke();
	}
	for (let y = 0; y <= height; y += cellSize) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(width, y);
		ctx.stroke();
	}
}