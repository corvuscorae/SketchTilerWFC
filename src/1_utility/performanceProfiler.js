/** Records data on the performances of functions. */
export default class PerformanceProfiler {
	/** @type {Map<string, { totalExecutionTime: number, timesCalled: number }>} */
	#data = new Map();

	/**
	 * Wraps a function, letting the profiler record its performance data each time it's called. To unwrap, write func = func.original.
	 * @param {Function} func
	 * @returns {Function}
	 */
	profile(func) {
		if (!func.name) throw new Error("Cannot pass anonymous (nameless) functions to profile()");
		if (func.original) return func;	// prevent double-wrapping

		const profiler = this;

		/**
		 * The wrapped version of a function. This version executes like normal but it now additionally lets the profiler record its performance data.
		 * @template T the return type of func (the function being wrapped)
		 * @param {...any} args any amount of arguments
		 * @returns {T} whatever func (the function being wrapped) returns
		 */
		function wrapped(...args) {
			const start = performance.now();
			const result = func(...args);
			const duration = performance.now() - start;
		
			if (profiler.#data.has(func.name)) {
				profiler.#data.get(func.name).totalExecutionTime += duration;
				profiler.#data.get(func.name).timesCalled++;
			}
			else {
				profiler.#data.set(func.name, {
					totalExecutionTime: duration,
					timesCalled: 1,
				});
			}
	
			return result;
		}
	
		wrapped.original = func; // for unwrapping
		return wrapped;
	}

	/** Console logs the performance data of all functions profiled. */
	logData() {
		let message = "";
		let combinedTotalExecutionTime = 0;

		for (const [funcName, funcData] of this.#data) {
			message += `${funcName}():\n`;
			message += `\tTotal Duration: ${funcData.totalExecutionTime} ms\n`;
			message += `\tAverage Duration: ${(funcData.totalExecutionTime / funcData.timesCalled).toFixed(2)} ms\n`
			message += `\tNum Calls: ${funcData.timesCalled}\n`;
			combinedTotalExecutionTime += funcData.totalExecutionTime;
		}
		message += `\nCombined Total Duration: ${combinedTotalExecutionTime} ms`;

		console.log(message);
	}

	/** Clears all tracked performance data. */
	clearData() {
		this.#data.clear();
	}
}