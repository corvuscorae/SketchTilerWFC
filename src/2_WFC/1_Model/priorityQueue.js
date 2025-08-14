export default class PriorityQueue{
    constructor(compareFn) {
        // Defaults to min-heap by entropy
        this.compare = compareFn || ((a, b) => a.entropy - b.entropy);
        this.heap = [];
        this.indexMap = new Map(); // Tracks positions in the heap
    }

    // ----- Heap utility functions -----
    _parent(i) { return Math.floor((i - 1) / 2); }
    _left(i) { return 2 * i + 1; }
    _right(i) { return 2 * i + 2; }

    _swap(i, j) {
        const tmp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = tmp;
        this.indexMap.set(this.heap[i], i);
        this.indexMap.set(this.heap[j], j);
    }

    _siftUp(i) {
        while (i > 0 && this.compare(this.heap[i], this.heap[this._parent(i)]) < 0) {
            this._swap(i, this._parent(i));
            i = this._parent(i);
        }
    }

    _siftDown(i) {
        while (true) {
            let smallest = i;
            const left = this._left(i);
            const right = this._right(i);

            if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
                smallest = left;
            }
            if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
                smallest = right;
            }
            if (smallest === i) break;

            this._swap(i, smallest);
            i = smallest;
        }
    }

    // override functions
    insert(item) {
        if (this.indexMap.has(item)) {
            this.update(item);
            return;
        }
        this.heap.push(item);
        const index = this.heap.length - 1;
        this.indexMap.set(item, index);
        this._siftUp(index);
    }

    extractMin() {
        if (this.heap.length === 0) return null;

        const min = this.heap[0];
        this.indexMap.delete(min);

        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.indexMap.set(last, 0);
            this._siftDown(0);
        }

        return min;
    }

    update(item) {
        const index = this.indexMap.get(item);
        if (index === undefined) return;

        // Sift in both directions in case priority increases or decreases
        this._siftUp(index);
        this._siftDown(index);
    }

    remove(item) {
        const index = this.indexMap.get(item);
        if (index === undefined) return;

        this.indexMap.delete(item);

        const last = this.heap.pop();
        if (index < this.heap.length) {
            this.heap[index] = last;
            this.indexMap.set(last, index);
            this._siftUp(index);
            this._siftDown(index);
        }
    }

    contains(item) {
        return this.indexMap.has(item);
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    buildHeap(cells) {
        this.heap = [...cells]; 
        this.indexMap.clear();
        for(let i = 0; i < this.heap.length; i++) {
            this.indexMap.set(this.heap[i], i);
        }
        for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
            this._siftDown(i);
        }
    }

    contains(cell) {
        return this.indexMap.has(cell);
    }
}