import { getDisplayList, setDisplayList } from "../sketchpad.js";

export function undo(action){
	const snapshot = getSnapshot();

	setDisplayList([...action.display]);
	setDisplayList([...action.redo], "redo");

	return snapshot;
}

export function redo(action) {
	const snapshot = getSnapshot();

	setDisplayList([...action.display]);
	setDisplayList([...action.redo], "redo");

    return snapshot;
}

export function getSnapshot(){
    return {
		display: [...getDisplayList()],
		redo: [...getDisplayList("redo")]
	};
}

