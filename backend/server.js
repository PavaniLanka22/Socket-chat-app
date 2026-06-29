const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Socket Server Running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {

  console.log("User Connected:", socket.id);

  // JOIN ROOM
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`${socket.id} joined ${room}`);
  });

  // SEND MESSAGE
  socket.on("send_message", (data) => {
    console.log("Received:", data);
    io.to(data.room).emit("receive_message", data);
  });

  // TYPING
  socket.on("typing", (data) => {
    socket.to(data.room).emit("typing", {
      author: data.author,
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });

});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});