import { LineDisplayble } from "../1_Classes/displayables.js";
import { chaikinSmooth, ramerDouglasPeucker } from "./lineCleanup.js";
import { getShape } from "./shapeDetection.js";

export function normalizeStrokes(displayList, canvas){
	// shape-ify each line in displayList
	for (const displayable of displayList) {
		if (displayable instanceof LineDisplayble) {
			if(!displayable.normalized){	// don't re-normalize a stroke that has already been normalized
				displayable.normalized = true;
				const shape = getShape(displayable.line.points);
				//console.log(displayable, shape)
				if(shape){
					displayable.line.points = shape.points;
				} else {
					// for unrecognized shapes, de-noise stroke by running rdp, then chaikin
					const simplified = ramerDouglasPeucker(displayable.line.points, 10); // Adjust tolerance as needed
					const smoothed = chaikinSmooth(simplified, 4);
					displayable.line.points = smoothed.filter(p => inCanvasBounds(p, canvas));
				}
			}
		}
	}
}

export function inCanvasBounds(p, canvas) {
	return p.x >= 0 && p.x <= canvas.width-1 && p.y >= 0 && p.y <= canvas.height-1;
}

// DEBUG: labels strokes' structure types
export function showDebugText(ctx, displayList){
	ctx.fillStyle = "black";      
	for(let d of displayList){
		let line = d.line;
		ctx.fillText(line.structure, line.points[0].x, line.points[0].y)
	}
}