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

let connectedPeers = [];
const hashMap = new Map();
const hashMapUser = new Map();

let user = "";

io.on("connection", (socket) => {

  user = {
    "user": `User_${hashMap.size}`,
    "connection_id": socket.id
  };
  hashMap.set(socket.id, `User_${hashMap.size}`);
  hashMapUser.set(user.user, user.connection_id);

  socket.emit('emitUser', {
    id: user
  });

  socket.on("pre-offer", (data) => {
    const { calleePersonalCode, callType } = data;
    console.log(data);
    // const connectedPeer = connectedPeers.find(
    //   (peerSocketId) => peerSocketId === calleePersonalCode
    // );

    const connectedPeer = hashMapUser.has(calleePersonalCode) ? hashMapUser.get(calleePersonalCode) : "";
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

    // const connectedPeer = connectedPeers.find(
    //   (peerSocketId) => peerSocketId === callerSocketId
    // );
    const connectedPeer = hashMap.has(callerSocketId);
    if (connectedPeer) {
      io.to(data.callerSocketId).emit("pre-offer-answer", data);
    }
  });

  socket.on("webRTC-signaling", (data) => {
    const { connectedUserSocketId } = data;

    // const connectedPeer = connectedPeers.find(
    //   (peerSocketId) => peerSocketId === connectedUserSocketId
    // );

    const connectedPeer = hashMap.has(connectedUserSocketId);
    if (connectedPeer) {
      io.to(connectedUserSocketId).emit("webRTC-signaling", data);
    }
  });

  socket.on("user-hanged-up", (data) => {
    const { connectedUserSocketId } = data;

    // const connectedPeer = connectedPeers.find(
    //   (peerSocketId) => peerSocketId === connectedUserSocketId
    // );

    const connectedPeer=hashMap.has(connectedUserSocketId);

    if (connectedPeer) {
      io.to(connectedUserSocketId).emit("user-hanged-up");
    }
  });

  socket.on("disconnect", () => {

    // const newConnectedPeers = connectedPeers.filter(
    //   (peerSocketId) => peerSocketId !== socket.id
    // );
    // connectedPeers = newConnectedPeers;
    hashMap.delete(socket.id);

  });
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
