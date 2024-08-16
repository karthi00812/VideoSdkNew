import * as store from "./store.js";

let mediaRecorder;

const vp9Codec = "video/webm; codecs=vp=9";
const vp9Options = { mimeType: vp9Codec };
const recordedChunks = [];

export const startRecording = () => {
  const remoteStream = store.getState().remoteStream;

  if (MediaRecorder.isTypeSupported(vp9Codec)) {
    mediaRecorder = new MediaRecorder(remoteStream, vp9Options);
  } else {
    mediaRecorder = new MediaRecorder(remoteStream);
  }

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
};

export const pauseRecording = () => {
  mediaRecorder.pause();
};

export const resumeRecording = () => {
  mediaRecorder.resume();
};

export const stopRecording = () => {
  mediaRecorder.stop();
};

const downloadRecordedVideo = () => {
  const blob = new Blob(recordedChunks, {
    type: "video/webm",
  });

  // const url = URL.createObjectURL(blob);
  // const a = document.createElement("a");
  // document.body.appendChild(a);
  // a.style = "display: none;";
  // a.href = url;
  // a.download = "recording.webm";
  // a.click();
  // window.URL.revokeObjectURL(url);

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "video/webm");
  let appId = "";
  appId = store.getApplicationId();
  if (!appId) {
    appId = "recordings-sample-name";
  }
  myHeaders.append("fileName", appId);

  const file = blob;

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: file,
    redirect: "follow"
  };

  fetch("/upload-file", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
};

const handleDataAvailable = (event) => {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
    downloadRecordedVideo();
  }
};
