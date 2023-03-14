import httpStatus from 'http-status';
import ValidationError from 'joi';
import JsonWebTokenError from 'jsonwebtoken';
import TokenExpiredError from 'jsonwebtoken';
import APIError from '../utils/APIError.js';

// const isDevelopment = process.env.NODE_ENV === 'development';
const isDevelopment = true;

const errorHandler = (err, _req, res, next) => {
    // Check for JWT authentication error from passport
    // if (err?.name === 'AuthenticationError') {
    //     console.error(err.message);

    //     res.status(httpStatus.UNAUTHORIZED).json({
    //         message: 'Unauthorized request',
    //         code: httpStatus.UNAUTHORIZED,
    //         stack_trace: isDevelopment ? err?.stack : undefined,
    //     });
    // } else if (err instanceof JsonWebTokenError) {
    //     console.error(err.message);

    //     res.status(httpStatus.UNAUTHORIZED).json({
    //         message: 'Unauthenticated request',
    //         code: httpStatus.UNAUTHORIZED,
    //         stack_trace: isDevelopment ? err?.stack : undefined,
    //     });
    // } else if (err instanceof TokenExpiredError) {
    //     console.error(err.message);

    //     res.status(httpStatus.UNAUTHORIZED).json({
    //         message: 'Token expired',
    //         code: httpStatus.UNAUTHORIZED,
    //         stack_trace: isDevelopment ? err?.stack : undefined,
    //     });
    // }

    // // Check for validation error from Joi
    // else if (err?.error instanceof ValidationError) {
    //     const error = err?.error;

    //     console.error(error.message);
    //     console.error(JSON.stringify(error.details, null, 2));

    //     res.status(httpStatus.BAD_REQUEST).json({
    //         message: error?.message ?? 'Something went wrong',
    //         code: httpStatus.BAD_REQUEST,
    //         stack_trace: isDevelopment ? err?.stack : undefined,
    //         data: isDevelopment ? { error: error?.details } : undefined,
    //     });
    //     } else if (err instanceof APIError) {
    // // } else if (err.substr(0, indexOf(" " - 1))) {
    //     console.error(err.message);

    //     res.status(err.status).json({
    //         message: err.message,
    //         code: err.status,
    //         stack_trace: isDevelopment ? err?.stack : undefined,
    //     });
    // } else if (err) {
    //     console.error(err.message);

    //     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    //         message: err.message,
    //         code: httpStatus.INTERNAL_SERVER_ERROR,
    //         stack_trace: isDevelopment ? err?.stack : undefined,
    //     });
    // }

    // // eslint-disable-next-line
    // if (isDevelopment) console.error(err);
    // err.substr(0, indexOf(" " - 1)) {
    // console.error(err.message);

    // res.status(400).json({
    //     message: err.message,
    //     code: 400,
    //     stack_trace: isDevelopment ? err?.stack : undefined,
    // });
    if (err.name == "APIError") {
        // } else if (err.substr(0, indexOf(" " - 1))) {
        console.error(err.message);

        res.status(err.status).json({
            message: err.message,
            code: err.status,
            stack_trace: isDevelopment ? err?.stack : undefined,
        })
    }
    // if (err.name = "RangeError") {
    //     // } else if (err.substr(0, indexOf(" " - 1))) {
    //     console.error(400);

    //     res.status(400).json({
    //         message: err.message,
    //         code: 400,
    //         stack_trace: isDevelopment ? err?.stack : undefined,
    //     })
    // }
    else if (err) {
        console.error(err.message);

        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: err.message,
            code: httpStatus.INTERNAL_SERVER_ERROR,
            stack_trace: isDevelopment ? err?.stack : undefined,
        });
    }

    next();
};

export default errorHandler;
