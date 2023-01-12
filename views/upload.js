const fileInputVideo = document.getElementById("fileInputVideo");
const fileInputSubtitles = document.getElementById("fileInputSubtitles");
const submitButton = document.getElementById("submitButton");

// upload file on change
fileInputVideo.addEventListener("change", (e) => {
	const file = e.target.files[0];
	const formData = new FormData();

	// when uploading a file, append below the input progress bar
	fileInputVideo.insertAdjacentHTML(
		"afterend",
		`<div class='progress-bar-container'>
            <div class='progress-bar'></div>
        </div>`
	);

	formData.append("upload-video", file, "video.mp4");

	fetch("/upload", {
		method: "POST",
		body: formData,
	});

	// reset input
	e.target.value = "";
});

fileInputSubtitles.addEventListener("change", (e) => {
	const file = e.target.files[0];
	const formData = new FormData();

	// when uploading a file, append below the input progress bar
	fileInputSubtitles.insertAdjacentHTML(
		"afterend",
		`<div class='progress-bar-container'>
            <div class='progress-bar'></div>
        </div>`
	);

	formData.append("upload-subtitles", file, "subtitles.vtt");

	fetch("/upload", {
		method: "POST",
		body: formData,
	});

	// reset input
	e.target.value = "";
});

submitButton.addEventListener("click", (e) => {
	e.preventDefault();
	fetch("/upload").then((res) => {
		res.json().then((data) => {
			if (data.status) {
				window.location.href = "/video";
			} else {
				alert("Please upload a video and subtitles first");
			}
		});
	});
});
