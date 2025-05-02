import TILEMAP from "../4_Phaser/tilemap.js";

const sketchpad = document.getElementById("sketchpad");
const gridCanvas = document.getElementById("grid-canvas");
const sketchCanvas = document.getElementById("sketch-canvas");

export default function initSketchpad() {
  const width = TILEMAP.WIDTH;
  const height = TILEMAP.HEIGHT;
  
  sketchpad.style.width = `${width}px`;
  sketchpad.style.height = `${height}px`;
  
  gridCanvas.width = width;
  gridCanvas.height = height;
  drawGrid();
  
  sketchCanvas.width = width;
  sketchCanvas.height = height;
  sketchCanvas.getContext("2d").font = "30px serif";
}

// TODO: make grid toggleable+
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