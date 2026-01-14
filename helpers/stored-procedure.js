const db = require("../config/dbconnection");
const util = require("util");

class StoredProcedure {
    constructor(name, params, db1, options = {}) {
        this.db = db1;
        this.name = name;
        this.params = params;
        this.options = options;
        this.buildQuery();
        this.baseTimeout = options.timeout || 30000;
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000;
    }

    buildQuery() {
        this.query = `call ${this.name} (${
            Array(this.params.length).fill('?').join(',')
        })`;
    }

    isObject(arg) {
        return arg !== null && typeof arg === "object";
    }

    calculateTimeout(attempt) {
        // Progressive timeout: increases with each retry
        return this.baseTimeout * (attempt + 1);
    }

    async result() {
        let lastError;
        
        for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
            const currentTimeout = this.calculateTimeout(attempt);
            
            try {
                const params = this.params.map(param => {
                    if (!param && typeof param === "undefined") return null;
                    if (this.isObject(param) && !Array.isArray(param)) return JSON.stringify(param);
                    if (Array.isArray(param) && param[0] && this.isObject(param[0])) return JSON.stringify(param);
                    return param;
                });

                const connection = this.db ? this.db : db.promise();
                const start = process.hrtime();
                
                const results = await Promise.race([
                    connection.query(this.query, params),
                    new Promise((_, reject) => 
                        setTimeout(
                            () => reject(new Error(`Database query timeout after ${currentTimeout}ms (attempt ${attempt + 1}/${this.retryAttempts})`)), 
                            currentTimeout
                        )
                    )
                ]);

                const duration = process.hrtime(start);
                const ms = duration[0] * 1000 + duration[1] / 1e6;
                
                if (ms > 1000) {
                    console.warn(`Slow SP detected (${ms.toFixed(2)}ms): ${this.name}`);
                }

                let rows = results[0];
                if (Array.isArray(rows)) {
                    // Check if it's an array of result sets (nested arrays)
                    if (rows.length > 0 && Array.isArray(rows[0])) {
                        const dataSet = rows.find(rs => Array.isArray(rs) && rs.length > 0 && typeof rs[0] === 'object' && !('affectedRows' in rs[0]));
                        return dataSet || rows[0];
                    }
                    // It's a flat array of rows
                    return rows;
                }
                return rows;
            } catch (error) {
                lastError = error;
                console.error(`SP Attempt ${attempt + 1}/${this.retryAttempts} failed:`, {
                    procedure: this.name,
                    error: error.message,
                    timeout: currentTimeout,
                    attempt: attempt + 1
                });

                if (error.message.includes('timeout') && attempt < this.retryAttempts - 1) {
                    console.log(`Retrying with increased timeout: ${this.calculateTimeout(attempt + 1)}ms`);
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                    continue;
                }
                
                if (attempt === this.retryAttempts - 1) {
                    throw new Error(`All retry attempts failed for ${this.name}. Last error: ${error.message}`);
                }
                
                throw error;
            }
        }
    }
}

module.exports = StoredProcedure;