import * as constants from "./constants.js";

let state = {
  socketId: null,
  localStream: null,
  remoteStream: null,
  screenSharingActive: false,
  screenSharingStream: null,
  allowConnectionsFromStrangers: false,
  callState: constants.callState.CALL_AVAILABLE_ONLY_CHAT,
  userName: null,
  remoteUser: null
};
let mediaDevices = [];
let videoDevices = [];
let audioDevices = [];
let selectedDevices = { audio: "", video: "" };

export const setSocketId = (socketId, userName) => {
  state = {
    ...state,
    socketId,
    userName
  };
};

export const setLocalStream = (stream) => {
  state = {
    ...state,
    localStream: stream,
  };
  let selectedVideo = {
    dataset: {
      deviceid: stream.getVideoTracks()[0].getSettings().deviceId
    }
  }

  let selectAudio = {
    dataset: {
      deviceid: stream.getAudioTracks()[0].getSettings().deviceId
    }
  }
  selectedDevices.video = selectedVideo;
  selectedDevices.audio = selectAudio;
};

export const setAllowConnectionsFromStrangers = (allowConnection) => {
  state = {
    ...state,
    allowConnectionsFromStrangers: allowConnection,
  };
};

export const setScreenSharingActive = (screenSharingActive) => {
  state = {
    ...state,
    screenSharingActive,
  };
};

export const setScreenSharingStream = (stream) => {
  state = {
    ...state,
    screenSharingStream: stream,
  };
};

export const setRemoteStream = (stream) => {
  state = {
    ...state,
    remoteStream: stream,
  };
};

export const setCallState = (callState) => {
  state = {
    ...state,
    callState,
  };
};

export const getState = () => {
  return state;
};

export const setRemoteUser = (remoteUser) => {
  state.remoteUser = remoteUser;
};

const setMediaDevices = async () => {
  if (mediaDevices.length == 0) {
    mediaDevices = await navigator.mediaDevices.enumerateDevices();
  }
  videoDevices = mediaDevices.filter((device) => { return device.kind === "videoinput" });
  audioDevices = mediaDevices.filter((device) => { return device.kind === "audioinput" });
}
export const getVideoDevices = () => {
  return videoDevices;
};

export const getAudioDevices = () => {
  return audioDevices;
}

export const setSelectedDevice = (devices) => {
  selectedDevices = {
    ...selectedDevices,
    ...devices
  };
}

export const getSelectedDevices = () => {
  return selectedDevices;
}

setMediaDevices();