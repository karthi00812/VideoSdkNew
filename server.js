const express = require("express");
const http = require("http");

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/customer", (req, res) => {
  res.sendFile(__dirname + "/public/customer.html");
});

app.get("/userDisconnected", (req, res) => {
  res.sendFile(__dirname + "/public/userDisconnected.html");
});

app.get("/agent", (req, res) => {
  res.sendFile(__dirname + "/public/agent.html");
});

let connectedPeers = [];
const hashMap = new Map();
const hashMapUser = new Map();

let user = "", connectedUser = [];

io.on("connection", (socket) => {

  if (connectedUser.length !== 0) {
    user = {
      "user": `User_${parseInt(connectedUser[connectedUser.length - 1].user.split("_")[1]) + 1}`,
      "connection_id": socket.id
    };
  } else {
    user = {
      "user": `User_0`,
      "connection_id": socket.id
    };
  }
  connectedUser.push(user);

  hashMap.set(socket.id, user.user);
  hashMapUser.set(user.user, user.connection_id);
  socket.emit('emitUser', {
    id: user
  });

  socket.on("pre-offer", (data) => {

    const { calleePersonalCode, callType } = data;
    const connectedPeer = hashMapUser.has(calleePersonalCode) ? hashMapUser.get(calleePersonalCode) : "";
    console.log(connectedPeer);
    if (connectedPeer) {
      const data = {
        callerSocketId: socket.id,
        callType,
      };
      io.to(connectedPeer).emit("pre-offer", data);
    } else {
      const data = {
        preOfferAnswer: "CALLEE_NOT_FOUND",
      };
      io.to(socket.id).emit("pre-offer-answer", data);
    }
  });

  socket.on("pre-offer-answer", (data) => {
    const { callerSocketId } = data;
    const connectedPeer = hashMap.has(callerSocketId);
    if (connectedPeer) {
      io.to(data.callerSocketId).emit("pre-offer-answer", data);
    }
  });

  socket.on("webRTC-signaling", (data) => {
    const { connectedUserSocketId } = data;
    let connectedUserSocketIdl;

    if (!hashMap.has(connectedUserSocketId)) {
      connectedUserSocketIdl = hashMapUser.has(connectedUserSocketId) ? hashMapUser.get(connectedUserSocketId) : "";
    } else {
      connectedUserSocketIdl = connectedUserSocketId;
    }


    if (connectedUserSocketIdl) {
      io.to(connectedUserSocketIdl).emit("webRTC-signaling", data);
    }
  });

  socket.on("user-hanged-up", (data) => {

    let connectedUserSocketId = data.connectedUserSocketId;
    let connectedUserSocketIdl;

    let userDelete = hashMap.get(socket.id);
    hashMap.delete(socket.id);
    connectedUser = connectedUser.filter((user) => user.user !== userDelete);

    if (!hashMap.has(connectedUserSocketId)) {
      connectedUserSocketIdl = hashMapUser.has(connectedUserSocketId) ? hashMapUser.get(connectedUserSocketId) : "";
    } else {
      connectedUserSocketIdl = connectedUserSocketId;
    }

    userDelete = hashMap.get(connectedUserSocketIdl);
    hashMap.delete(connectedUserSocketIdl);
    connectedUser = connectedUser.filter((user) => user.user !== userDelete);
    console.log(connectedUser);
    io.to(connectedUserSocketIdl).emit("redirectHomePage", data);
  });

  socket.on("disconnect", () => {

    const userDelete = hashMap.get(socket.id);
    hashMapUser.delete(userDelete);
    hashMap.delete(socket.id);
    connectedUser = connectedUser.filter((user) => user.user !== userDelete);
  });
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
