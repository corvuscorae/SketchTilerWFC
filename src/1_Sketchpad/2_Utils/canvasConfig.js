export const conf = {
    lineThickness: 5,
    sizeThreshold: 5,	// number of points that must be drawn for the stroke to be recorded
    // NOTE: regions can be "box" or "trace",
    //    this will be the region that structure generators use to place tiles.
    structures: {  
        "House" : { color: '#f54242', regionType: "box"   },
        "Forest": { color: '#009632', regionType: "box"   },
        "Fence" : { color: '#f5c842', regionType: "trace" },
        "Path"  : { color: '#8000ff', regionType: "trace" },
    }
}