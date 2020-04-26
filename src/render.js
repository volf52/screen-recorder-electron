const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;

// Buttons
const videoElement = document.querySelector('video');

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
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
