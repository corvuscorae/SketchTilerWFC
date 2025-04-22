//import "./style.css";
//* HTML SETUP *//
const APP_NAME = "Sketch Co-Collaborate";
const app = document.querySelector("#app");

// page info
document.title = APP_NAME;

const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.append(header);

// grid canvas
const gridCanvas = document.createElement("canvas");
gridCanvas.width = window.game.config.width;
gridCanvas.height = window.game.config.height;

// set up drawing canvas
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
canvas.width = window.game.config.width;
canvas.height = window.game.config.height;
canvas.style.cursor = "none";
context.font = "30px serif";

const canvasContainer = document.createElement("div");
canvasContainer.style.position = "relative";
canvasContainer.style.width = `${canvas.width}px`;
canvasContainer.style.height = `${canvas.height}px`;

gridCanvas.style.position = "absolute";
canvas.style.position = "absolute";

canvasContainer.append(gridCanvas);
canvasContainer.append(canvas);
app.append(canvasContainer);

// Button container for proper styling
const buttonContainer = document.createElement("div");
buttonContainer.classList.add("button-container"); // Add a class for CSS styling
app.append(buttonContainer);

export { canvas, context, buttonContainer }

// TODO: make grid togglable+
export function drawGrid(cellSize = 16, color = '#DBDBDB') {
    const ctx = gridCanvas.getContext('2d');
    const width = gridCanvas.width;
    const height = gridCanvas.height;
  
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
  
    console.log(ctx)
    // Draw vertical lines
    for (let x = 0; x <= width; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  
    // Draw horizontal lines
    for (let y = 0; y <= height; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
}
  