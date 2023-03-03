import Router from 'express';
// const chatRoutes = require("./chatRoutes");
// const messageRoute = require("./messageRoute");
import userRouter from './userRoutes.js';
import chatRouter from './chatRoutes.js';
import messageRouter from './messageRoute.js';
const router = Router();

router.get('/status', (req, res) => {
    console.log(req.url);
    res.json({ message: 'Server is live!' });
});

router.use("/user", (req, res, next) => { console.log(req.url); next() }, userRouter);
router.use("/chat", (req, res, next) => { console.log(req.url); next() }, chatRouter);
router.use("/message", (req, res, next) => { console.log(req.url); next() }, messageRouter);


export default router;