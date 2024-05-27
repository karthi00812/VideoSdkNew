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

io.on("connection", (socket) => {

  hashMap.set(`User_${hashMap.size + 1}`, socket.id);

  socket.on("pre-offer", (data) => {
    const { calleePersonalCode, callType } = data;
    // const connectedPeer = connectedPeers.find(
    //   (peerSocketId) => peerSocketId === calleePersonalCode
    // );

    const connectedPeer = connectedPeers.has(calleePersonalCode) ? connectedPeers.has(calleePersonalCode).get(calleePersonalCode) : "";
  
    if (connectedPeer) {
      const data = {
        callerSocketId: socket.id,
        callType,
      };
      calleePersonalCode=connectedPeer;
      io.to(calleePersonalCode).emit("pre-offer", data);
    } else {
      const data = {
        preOfferAnswer: "CALLEE_NOT_FOUND",
      };
      io.to(socket.id).emit("pre-offer-answer", data);
    }
  });

  socket.on("pre-offer-answer", (data) => {
    const { callerSocketId } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketId) => peerSocketId === callerSocketId
    );

    if (connectedPeer) {
      io.to(data.callerSocketId).emit("pre-offer-answer", data);
    }
  });

  socket.on("webRTC-signaling", (data) => {
    const { connectedUserSocketId } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketId) => peerSocketId === connectedUserSocketId
    );

    if (connectedPeer) {
      io.to(connectedUserSocketId).emit("webRTC-signaling", data);
    }
  });

  socket.on("user-hanged-up", (data) => {
    const { connectedUserSocketId } = data;

    const connectedPeer = connectedPeers.find(
      (peerSocketId) => peerSocketId === connectedUserSocketId
    );

    if (connectedPeer) {
      io.to(connectedUserSocketId).emit("user-hanged-up");
    }
  });

  socket.on("disconnect", () => {
    const newConnectedPeers = connectedPeers.filter(
      (peerSocketId) => peerSocketId !== socket.id
    );
    connectedPeers = newConnectedPeers;
  });
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
