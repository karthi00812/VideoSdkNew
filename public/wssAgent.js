import * as store from "./store.js";
import * as webRTCHandler from "./RTCHandlerAgent.js";
import * as constants from "./constants.js";
import * as ui from "./uiInteract.js";
import * as sessionTool from "./agent.js";

let socketIO = null;

export const registerSocketEvents = (socket) => {
  socketIO = socket;

  socket.on("emitUser", (msg) => {
    console.log("socket connected emitUser" + JSON.stringify(msg));
    store.setSocketId(msg.id.connection_id, msg.id.user);
    ui.updatePersonalCode(msg.id.user);
    const connect_vc = document.querySelector("#connect_vc");
    connect_vc.classList.remove("btn-secondary");
    connect_vc.classList.add("btn-success");
    connect_vc.textContent = "Disconnect VC";
    connect_vc.dataset.status = "connected";
    document.querySelector("#status").textContent = "VC Connected";
    sessionTool.session.start();
  });

  socket.on("pre-offer", (data) => {
    webRTCHandler.handlePreOffer(data);
  });

  socket.on("pre-offer-answer", (data) => {
    webRTCHandler.handlePreOfferAnswer(data);
  });

  socket.on("user-hanged-up", () => {
    webRTCHandler.handleConnectedUserHangedUp();
  });

  socket.on("redirectHomePage", () => {

    window.location.href = "/userDisconnected";
  });

  let ringtone = new Audio("./audio/user_disconnect.mp3");
  socket.on("disconnect", () => {

    ringtone.play();
    const status_bar = document.querySelector("#status_bar");
    status_bar.style.display = "flex";
    document.querySelector("#user_id").textContent = "####";
    const connect_vc = document.querySelector("#connect_vc")
    connect_vc.classList.add("btn-secondary");
    connect_vc.classList.remove("btn-success");
    connect_vc.textContent = "Connect VC";
    connect_vc.dataset.status = "disconnected";
    console.log("socket disconnected");
    ringtone.pause();
    sessionTool.session.dispose();
  });

  socket.on("connect", () => {
    const status_bar = document.querySelector("#status_bar");
    status_bar.style.display = "none";
    console.log("socket connected");
  })

  socket.on("webRTC-signaling", (data) => {
    switch (data.type) {
      case constants.webRTCSignaling.OFFER:
        webRTCHandler.handleWebRTCOffer(data);
        break;
      case constants.webRTCSignaling.ANSWER:
        webRTCHandler.handleWebRTCAnswer(data);
        break;
      case constants.webRTCSignaling.ICE_CANDIDATE:
        webRTCHandler.handleWebRTCCandidate(data);
        break;
      default:
        return;
    }
  });
};

export const sendPreOffer = (data) => {
  socketIO.emit("pre-offer", data);
};

export const sendPreOfferAnswer = (data) => {
  socketIO.emit("pre-offer-answer", data);
};

export const sendDataUsingWebRTCSignaling = (data) => {
  socketIO.emit("webRTC-signaling", data);
};

export const sendUserHangedUp = (data) => {
  socketIO.emit("user-hanged-up", data);
};

export const sendConnectionStatus = (data) => {
  socketIO.emit("updateConnectionStatus", data);
};