/**
 * Run multiple async tasks with a limit on how many can run in parallel.
 * 
 * @param {Array} items - The items to process
 * @param {number} limit - Maximum number of parallel tasks
 * @param {Function} fn - Async function to run for each item (item -> Promise)
 * @param {Function} onProgress - Optional callback for progressive updates (result, item, index)
 * @returns {Promise<Array>} - Resolves with all results
 */
export async function withConcurrencyLimit(items, limit, fn, onProgress) {
    const results = [];
    const executing = new Set();
    const itemsWithIndex = items.map((item, index) => ({ item, index }));

    for (const { item, index } of itemsWithIndex) {
        // Create a wrapper promise that removes itself from 'executing' when done
        const p = Promise.resolve().then(() => fn(item, index)).then(result => {
            executing.delete(p);
            if (onProgress) onProgress(result, item, index);
            results[index] = result;
            return result;
        }).catch(err => {
            executing.delete(p);
            console.error(`Error processing item ${index}:`, err);
            results[index] = { error: err, status: 'error' };
            if (onProgress) onProgress(results[index], item, index);
        });

        executing.add(p);
        
        // If we've reached the limit, wait for one of the executing tasks to finish
        if (executing.size >= limit) {
            await Promise.race(executing);
        }
    }

    // Wait for all remaining tasks to complete
    await Promise.all(executing);
    return results;
}

/**
 * Simple retry wrapper for async functions.
 * 
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Number of retries (default 2)
 * @param {number} delay - Base delay in ms (default 1000)
 */
export async function withRetry(fn, retries = 2, delay = 1000) {
    let lastError;
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            if (i < retries) {
                const waitTime = delay * Math.pow(2, i); // Exponential backoff
                console.warn(`Attempt ${i + 1} failed, retrying in ${waitTime}ms...`, err);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    throw lastError;
}
