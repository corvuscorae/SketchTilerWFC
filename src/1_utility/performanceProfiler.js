/*
	Did a lot of AI consulting (ChatGPT) to write register()
	The ideas of returning a wrapped function and using Function.apply() is credited to it
*/

/** Records data on the performances of functions. */
export default class PerformanceProfiler {
	/** @type {Map<string, { totalExecutionTime: number, timesCalled: number }>} */
	data = new Map();

	/**
	 * Registers a function to have its performance data recorded each time it's called.
	 * @param {Function} func
	 * @returns {Function}
	 */
	register(func) {
		if (!func.name) throw new Error("The function cannot be anonymous (nameless)");
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
			const result = func.apply(this, args);	// set the this context for func to its caller
			const duration = performance.now() - start;
		
			if (profiler.data.has(func.name)) {
				profiler.data.get(func.name).totalExecutionTime += duration;
				profiler.data.get(func.name).timesCalled++;
			}
			else {
				profiler.data.set(func.name, {
					totalExecutionTime: duration,
					timesCalled: 1,
				});
			}
	
			return result;
		}
	
		wrapped.original = func; // for unwrapping
		return wrapped;
	}

	/**
	 * Unregisters a function from having its performance data recorded each time it's called.
	 * @param {Function} func
	 * @returns {Function}
	 */
	unregister(func) {
		return func.original ?? func;
	}

	/** Console logs the performance data of all functions profiled. */
	logData() {
		let message = "";
		let combinedTotalExecutionTime = 0;

		for (const [funcName, funcData] of this.data) {
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
		this.data.clear();
	}
}