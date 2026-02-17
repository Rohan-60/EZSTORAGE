/**
 * Error Handler Middleware
 * Global error handling for Express application
 */

const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Must be the last middleware in the chain
 */
function errorHandler(err, req, res, next) {
    // Log the error
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });

    // Default error response
    const errorResponse = {
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
            ? 'An error occurred processing your request'
            : err.message,
    };

    // Include stack trace in development only
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Send error response
    res.status(statusCode).json(errorResponse);
}

/**
 * Async route handler wrapper
 * Catches errors in async route handlers
 * 
 * Usage: 
 * router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Not Found error creator
 */
function notFound(message = 'Resource not found') {
    const error = new Error(message);
    error.statusCode = 404;
    return error;
}

/**
 * Bad Request error creator
 */
function badRequest(message = 'Bad request') {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}

/**
 * Unauthorized error creator
 */
function unauthorized(message = 'Unauthorized') {
    const error = new Error(message);
    error.statusCode = 401;
    return error;
}

/**
 * Forbidden error creator
 */
function forbidden(message = 'Forbidden') {
    const error = new Error(message);
    error.statusCode = 403;
    return error;
}

module.exports = errorHandler;
module.exports.asyncHandler = asyncHandler;
module.exports.notFound = notFound;
module.exports.badRequest = badRequest;
module.exports.unauthorized = unauthorized;
module.exports.forbidden = forbidden;
