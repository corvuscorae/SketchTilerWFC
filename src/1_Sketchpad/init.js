const width = window.game.config.width;
const height = window.game.config.height;

const sketchpad = document.getElementById("sketchpad");
sketchpad.style.width = `${width}px`;
sketchpad.style.height = `${height}px`;

const gridCanvas = document.getElementById("grid-canvas");
gridCanvas.width = width;
gridCanvas.height = height;
drawGrid();

const sketchCanvas = document.getElementById("sketch-canvas");
sketchCanvas.width = width;
sketchCanvas.height = height;
//ctx.font = "30px serif";

// TODO: make grid togglable+
function drawGrid() {
	const cellSize = 16;
	const color = "#DBDBDB";

	const width = gridCanvas.width;
	const height = gridCanvas.height;
	const ctx = gridCanvas.getContext("2d");
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