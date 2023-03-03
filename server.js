import createExpressApp from "./createExpressConnection.js";
import createSocketConnection from "./createSocketConnection.js";
import 'dotenv/config';
import { connect } from "./config/db.js";

async function bootstrap() {
  try {

    // dotenv.config();
    const PORT = process.env.PORT
    const app = createExpressApp();
    connect();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port:${PORT}`);
    });
    const io = createSocketConnection(server);
    io.on("connection", (socket) => {
      console.log("connected to socket.io");

      socket.on("setup", (user) => {
        socket.join(user?._id);
        console.log(user?._id);
        socket.emit("connected");
      });

      socket.on("join chat", (room) => {
        socket.join(room);
        console.log("user joined room : ", room);
      });

      socket.on("new message", (newMessage) => {
        const { chat, sender } = newMessage;

        if (!chat.users) return console.log("no user found");

        chat.users.forEach((user) => {
          if (user._id == sender._id) return;
          socket.in(user._id).emit("message received", newMessage);
        });
      });

      socket.on("typing", (room) => {
        socket.in(room).emit("typing");
      });
      socket.on("stop typing", (room) => {
        socket.in(room).emit("stop typing");
      });
      socket.on("read", (data) => {
        const { room, users } = data;
        socket.in(room).emit("read by", { room, users });
      });
    });
    return server;
  } catch (err) {
    if (err) console.error(err.message);
    return null;
  }
}

const server = bootstrap();
export default server;