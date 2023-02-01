const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const axios = require("axios");
const path = require("path");

// used for file upload
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/uploads/");
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});
const upload = multer({ storage: storage });

// used for routes
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("/", function (req, res) {
	res.render("index");
});

app.get("/video", function (req, res) {
	res.render("video");
});

app.post(
	"/upload",
	upload.fields([{ name: "upload-video" }, { name: "upload-subtitles" }]),
	(req, res) => res.send("Files uploaded")
);

// check if file and subtitles have been uploaded in the public folder
app.get("/upload", function (req, res) {
	// access public folder
	const fs = require("fs");
	const path = require("path");

	// if no public/uploads folder, create one
	if (!fs.existsSync(path.join(__dirname, "public/uploads"))) {
		fs.mkdirSync(path.join(__dirname, "public/uploads"));
	}

	// get all files in public folder
	const files = fs.readdirSync(path.join(__dirname, "public/uploads"));

	// check if video and subtitles have been uploaded
	const videoUploaded = files.includes("video.mp4");

	const subtitlesUploaded = files.includes("subtitles.vtt");

	return res.send({
		status: videoUploaded && subtitlesUploaded,
	});
});

app.post("/", async function (req, res) {
	// fetch translation from jisho.org
	const response = await axios.get(
		`https://jisho.org/api/v1/search/words?keyword=${req.body.title}`
	);
	try {
		if (response.data.data.length > 0 == false) {
			return res.send({
				english_definitions: ["No translation found"],
				reading: "No reading found",
			});
		}
		// get hiragana from response
		const reading = response.data.data[0].japanese[0]?.reading || "";

		// get english translation from response
		const english_definitions =
			response.data.data[0]?.senses[0]?.english_definitions || [];

		res.send({
			english_definitions,
			reading,
		});
	} catch (error) {
		console.debug(error);
		res.send("No translation found");
	}
});

// listen to port 3001
app.listen(3001, function () {
	console.debug("Server started on port 3001");
});
