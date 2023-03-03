/**
 * API Error
 * @typedef {object} APIErrorResponse
 * @property {string} message - Error message
 * @property {number} status - HTTP status code
 */
class APIError extends Error {
    status;

    constructor(message, status) {
        super(message);
        this.name = 'APIError';
        this.status = status;

        Error.call(this, message);
        Error.captureStackTrace(this, APIError);
        Object.setPrototypeOf(this, APIError.prototype);
    }
}

export default APIError;
