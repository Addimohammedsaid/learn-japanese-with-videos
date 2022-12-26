const video = document.getElementById("video");

// make subtitle outside of video
const subtitles = document.getElementById("subtitles");

// popup to show translation
const popup = document.getElementById("popup");

const popupTitle = document.getElementById("popup-title");

const popupContent = document.getElementById("popup-content");

const popupClose = document.getElementById("popup-close");

const popupText = document.getElementById("popup-text");

const popupMore = document.getElementById("popup-more");

const popupSave = document.getElementById("popup-save");

// close popup when clicked outside
popup.addEventListener("click", function (e) {
	if (e.target === popup) {
		popup.style.display = "none";
		video.play();
		subtitles.querySelectorAll("span").forEach((span) => {
			span.classList.remove("highlight");
		});
	}
});

// close popup when clicked close button
popupClose.addEventListener("click", function () {
	popup.style.display = "none";
	video.play();
	// remove highlighted span
	subtitles.querySelectorAll("span").forEach((span) => {
		span.classList.remove("highlight");
	});
});

// read local vtt file
const track = video.textTracks[0];

// when video is playing
video.addEventListener("timeupdate", () => {
	// get current time of video
	const currentTime = video.currentTime;

	// get current subtitle
	const currentSubtitle = track.activeCues[0];

	// if current subtitle is not null
	if (currentSubtitle) {
		// get start time of current subtitle
		const startTime = currentSubtitle.startTime;

		// get end time of current subtitle
		const endTime = currentSubtitle.endTime;

		// if current time is greater than start time and less than end time
		if (currentTime > startTime && currentTime < endTime) {
			const segs = wanakana.tokenize(currentSubtitle.text);

			const subtitle = segs
				.map((seg) => {
					if (wanakana.isJapanese(seg)) {
						return `<span>${seg}</span>`;
					}
					return seg;
				})
				.join("");

			// set subtitle to subtitles div
			subtitles.innerHTML = subtitle;
		}
	}
});

// if click on span in subtitles div
// show translation of the word using jisho.org
subtitles.addEventListener("click", async (e) => {
	if (e.target.tagName === "SPAN") {
		// pause video
		video.pause();

		// get word
		const word = e.target.innerText;

		// remove highlighted span
		subtitles.querySelectorAll("span").forEach((span) => {
			span.classList.remove("highlight");
		});

		// keep the word highlighted
		e.target.classList.add("highlight");

		// clean up the word
		const wordWithoutApostrophe = word.replace(/'/g, "");

		// translate word in english
		const response = await fetch("/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ title: wordWithoutApostrophe }),
		});

		// get response from server
		const data = await response.json();

		// if response is not empty
		if (data) {
			// if kanji we render with furigana above title
			if (wanakana.isKanji(word)) {
				const reading = data.reading;
				popupTitle.innerHTML = `<span class="furigana">${reading}</span><br><h3>${word}</h3>`;
			} else {
				popupTitle.innerHTML = `<h3>${word}</h3>`;
			}

			popupTitle.innerHTML = `<h3>${word}</h3>`;

			// update data-title attribute of popup
			popupTitle.setAttribute("data-title", word);

			// show popup with translation
			popup.style.display = "block";

			// set content of popup to the translation
			popupText.innerText = data.english_definitions.join(", ");
		}
	}
});

// when click on more redirect the selected word to jisho.org
popupMore.addEventListener("click", () => {
	const word = popupTitle.innerText;
	window.open(`https://jisho.org/search/${word}`, "_blank");
});

// take screenshot when click on save button
popupSave.addEventListener("click", () => {
	// get the word that is clicked
	const word = popupTitle.innerText;

	video.crossOrigin = "Anonymous";

	// get canvas
	const canvas = document.getElementById("canvas");

	// set canvas width and height
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;

	// get canvas context
	const context = canvas.getContext("2d");

	// allow origin
	context.crossOrigin = "anonymous";

	// draw text on top image
	context.drawImage(video, 0, 0, canvas.width, canvas.height);

	// set font
	context.font = "30px Arial";

	// set color
	context.fillStyle = "white";

	// set text align
	context.textAlign = "center";

	// set text baseline
	context.textBaseline = "middle";

	// draw text
	context.fillText(word, canvas.width / 2, canvas.height / 2);

	// get image data
	const data = canvas.toDataURL("image/png");
});
