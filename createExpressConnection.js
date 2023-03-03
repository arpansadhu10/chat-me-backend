import express from 'express';
import morgan from 'morgan';
import router from './routes/index.js';
import errorHandler from './middleware/errorHandlerMiddleware.js';
import cors from 'cors'
const createExpressApp = () => {
    try {
        const app = express();
        app.disable('x-powered-by');
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        // app.use(timeout('15s'));
        // app.use(morgan('combined', { stream, immediate: true }));
        app.use(
            cors({
                origin: ["http://localhost:3000", "https://web-chatme.netlify.app", "https://chatme.streamify.co.in"],
            })
        );

        app.get('/favicon.ico', (req, res) => res.status(204));
        app.use('/api', router);

        app.use(errorHandler);
        return app;
    } catch (err) {
        if (err) console.error(err.message);
        throw err;
    }
}

export default createExpressApp;