
import { Server } from "socket.io";
// import io from "socket.io"
const createSocketConnection = (server) => {
    try {
        const io = new Server(server, {
            pingTimeout: 60000,
            cors: {
                origin: ["http://localhost:3000", "https://web-chatme.netlify.app", "https://chatme.streamify.co.in"],
            },
        }, () => { console.log("socket server started"); });

        return io;
    } catch (err) {
        if (err) console.error(err.message);
        throw err;
    }
}

export default createSocketConnection;

