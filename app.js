const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("/", function (req, res) {
	res.render("index");
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

		// show popup with available translation
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
