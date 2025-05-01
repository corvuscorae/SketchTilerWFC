//* STRAIGHTEN LINES *//
// Ramer-Douglas-Peucker algorithm to simplify lines
export function ramerDouglasPeucker(points, tolerance) {
    // Find the point with the maximum perpendicular distance
    let dmax = 0;
    let index = 0;
    const end = points.length - 1;
  
    for (let i = 1; i < end; i++) {
      const d = perpendicularDistance(points[i], points[0], points[end]);
      if (d > dmax) {
        index = i;
        dmax = d;
      }
    }
  
    // If the maximum distance is greater than the tolerance, recursively simplify
    if (dmax > tolerance) {
      const left = ramerDouglasPeucker(points.slice(0, index + 1), tolerance);
      const right = ramerDouglasPeucker(points.slice(index), tolerance);
      return [...left.slice(0, left.length - 1), ...right];
    } else {
      return [points[0], points[end]];
    }
}

// Helper function to calculate the perpendicular distance from a point to a line
function perpendicularDistance(point, start, end) {
    const numerator = Math.abs((end.y - start.y) * point.x - (end.x - start.x) * point.y + end.x * start.y - end.y * start.x);
    const denominator = Math.sqrt(Math.pow(end.y - start.y, 2) + Math.pow(end.x - start.x, 2));
    return numerator / denominator;
}