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