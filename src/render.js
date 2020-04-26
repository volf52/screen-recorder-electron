const { desktopCapturer, remote } = require('electron');
const { writeFile } = require('fs');
const { Menu, dialog } = remote;

// Media recorder instance to capture footage
let mediaRecorder;
const recordedChunks = [];

// Buttons
const videoElement = document.querySelector('video');

const startBtn = document.getElementById('startBtn');
startBtn.onclick = (e) => {
    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
};

const stopBtn = document.getElementById('stopBtn');
stopBtn.onclick = (e) => {
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
};

const videoSelectBtn = document.getElementById('videoSelectBtn');

// Get the available video sources
const getVideoSources = async () => {
    const inputSources = await desktopCapturer.getSources({
        types: [ 'window', 'screen' ],
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map((source) => {
            return {
                label: source.name,
                click: () => selectSource(source),
            };
        }),
    );

    videoOptionsMenu.popup();
};

videoSelectBtn.onclick = getVideoSources;

const selectSource = async (source) => {
    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id,
            },
        },
    };

    // Create a stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Preview the source in the video elem
    videoElement.srcObject = stream;
    videoElement.play();

    // Create the media recorder
    const opts = {
        mimeType: 'video/webm; codecs=vp9',
    };
    mediaRecorder = new MediaRecorder(stream, opts);

    // Register event handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
};

const handleDataAvailable = (e) => {
    console.log('Data available');
    recordedChunks.push(e.data);
};

const handleStop = async (e) => {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9',
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`,
    });

    console.log(filePath);

    writeFile(filePath, buffer, () => console.log('Video saved successfully'));
};
