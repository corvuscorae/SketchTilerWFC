import { ramerDouglasPeucker } from "./lineCleanup.js";

/* SHAPE DETECTION */
export function getShape(pts, threshold = 300){
    if(isCircle(pts, threshold)) return "circle";
    else if(isRect(pts)) return "rect";
    else if(isTriangle(pts)) return "triangle";
    else return "unrecognized"
}

// triangle
function isTriangle(pts){
    const anglePts = ramerDouglasPeucker(pts, 10);    // simplify strokes
    if (countSharpAngles(anglePts) === 3) return true;
    return false;
}

// rect
function isRect(pts){
    const anglePts = ramerDouglasPeucker(pts, 10);    // simplify strokes
    if (countSharpAngles(anglePts) === 4) return true;
    return false;
}

// circle
function isCircle(pts, threshold) {
	if (!isClosed(pts)) return false;

	const center = getCentroid(pts);

	// for each point, compute euclidean distance to the center 
	const distances = pts.map(p => Math.hypot(p.x - center.x, p.y - center.y));
	// calculate average radius
	const avg = distances.reduce((a, b) => a + b, 0) / distances.length; // NOTE TO SELF: i think this value + center can also be used to generate a neat circle using canvas circle method
	// calculate how far each distance is from avg
	const variance = distances.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / distances.length;
  
    // check for sharp angles to prevent squares from being classified as circles
    const anglePts = (pts.length < 50) ? pts : ramerDouglasPeucker(pts, 10);    // simplify larger strokes
    if (countSharpAngles(anglePts) > 2) return false;

	// higher threshold = more sloppiness allowed
	return variance < threshold; 
}

// helper: approximates the center of the shape by averaging the x and y values of each point
function getCentroid(pts) {
	const sum = pts.reduce((acc, p) => (
		{ x: acc.x + p.x, y: acc.y + p.y }
	));
	return { x: sum.x / pts.length, y: sum.y / pts.length };
}

// helper: returns whether stroke is closed (end point within threshold from start)
function isClosed(pts, threshold = 60) {
	// compute euclidean distance between start and end point
	const dist = Math.hypot(
		pts[0].x - pts[pts.length - 1].x, 
		pts[0].y - pts[pts.length - 1].y
	);
	return dist < threshold;
}

// helper: calculate + count the angles between adjacent point triplets
export function countSharpAngles(points, angleThreshold = 110) {
    let sharpAngles = 0;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const c = (i === points.length - 1) ? points[1] : points[i + 1]; // wrap if last point
  
      const ab = { x: a.x - b.x, y: a.y - b.y };
      const cb = { x: c.x - b.x, y: c.y - b.y };
  
      const dot = ab.x * cb.x + ab.y * cb.y;
      const magAB = Math.hypot(ab.x, ab.y);
      const magCB = Math.hypot(cb.x, cb.y);
      const cosAngle = dot / (magAB * magCB);
  
      const angle = Math.acos(cosAngle) * (180 / Math.PI);
  
      if (angle < angleThreshold) {
        sharpAngles++;
      }
    }
    return sharpAngles;
  }
  