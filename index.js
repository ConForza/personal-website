// Module imports
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import axios from "axios";
import "dotenv/config";

import Concert from "./models/Concert.js";
import Blog from "./models/Blog.js";
import Scale from "./models/Scale.js";

import pageRoutes from "./routes/pages.js";
import concertRoutes from "./routes/concerts.js";
import blogRoutes from "./routes/blog.js";
import classicalMusicDatabaseRoutes from "./routes/classicalMusicDatabase.js";

// Express setup

const app = express();
const port = process.env.PORT || 3000;
const mongoConfig = process.env.MONGO_CONFIG;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", pageRoutes);
app.use("/", concertRoutes);
app.use("/", blogRoutes);
app.use("/", classicalMusicDatabaseRoutes);
await mongoose.connect(mongoConfig);
// Option for local MongoDB:
// await mongoose.connect("mongodb://0.0.0.0:27017/concertsDB")

// Scales Helper app
app.get("/apps/scales-helper", async (req, res) => {
  res.render("scales-helper/index.ejs");
});

app.post("/apps/scales-helper", async (req, res) => {
  // Load submitted user options
  let showImage = req.body["reveal-hint"];
  let arpeggio = req.body["arpeggios"];
  let scale = req.body["scales"];
  let boardOption = req.body["exam-board"];
  let gradeOption = req.body["grade"];
  let scaleOption = req.body["scale-options"];
  let arpeggioOption = req.body["arpeggio-options"];
  let exerciseName;

  // Select random mode (major, minor) for separate hand scale option
  if (scaleOption == "separate-hands") {
    const majorMinor = ["separate-hands-major", "separate-hands-harmonic"];
    scaleOption = majorMinor[Math.floor(Math.random() * 2)];
  }

  // Select random hand for separate hand arpeggio option
  if (arpeggioOption == "separate-hands") {
    const majorMinor = [
      "separate-hands-major-arpeggio",
      "separate-hands-minor-arpeggio",
    ];
    arpeggioOption = majorMinor[Math.floor(Math.random() * 2)];
  }

  let query = {};
  // Queries
  // Load options as query parameters
  if (!(arpeggio == "on" && scale == "on")) {
    if (arpeggio == "on") {
      query["group"] = "arpeggios";
      if (!(arpeggioOption == "all")) {
        query["type"] = arpeggioOption;
      }
    } else if (scale == "on") {
      query["group"] = "scales";
      if (!(scaleOption == "all")) {
        query["type"] = scaleOption;
      }
    }
  } else {
    if (!(arpeggioOption == "all" && scaleOption == "all")) {
      if (!(arpeggioOption == "all") && scaleOption == "all") {
        query = { $or: [{ group: "scales" }, { type: arpeggioOption }] };
      } else if (!(scaleOption == "all") && arpeggioOption == "all") {
        query = { $or: [{ group: "arpeggios" }, { type: scaleOption }] };
      } else {
        query["type"] = { $in: [arpeggioOption, scaleOption] };
      }
    }
  }
  if (boardOption) {
    query["grades.board"] = boardOption;
    if (!(gradeOption == "all")) {
      query["grades.grades"] = gradeOption;
    }
  }

  const results = await Scale.find(query);

  // Function for selecting random hand
  function randomHandGenerator() {
    const hands = ["left", "right"];
    let randomHand = hands[Math.floor(Math.random() * 2)];
    return randomHand;
  }

  if (results.length > 0) {
    // Select random scale from results
    const randomScale = results[Math.floor(Math.random() * results.length)];
    let key = randomScale.name;

    switch (randomScale.type) {
      // Manipulate titles into more understandable forms
      case "minor-arpeggio":
        exerciseName = `${key} minor arpeggio, hands together`;
        break;
      case "similar-harmonic":
        exerciseName = `${key} harmonic minor scale, similar motion`;
        break;
      case "contrary-harmonic":
        exerciseName = `${key} harmonic minor scale, contrary motion`;
        break;
      case "harmonic-third":
        exerciseName = `${key} harmonic minor scale, third apart`;
        break;
      case "harmonic-sixth":
        exerciseName = `${key} harmonic minor scale, sixth apart`;
        break;
      case "similar-melodic":
        exerciseName = `${key} melodic minor scale, similar motion`;
        break;
      case "melodic-third":
        exerciseName = `${key} melodic minor scale, third apart`;
        break;
      case "melodic-sixth":
        exerciseName = `${key} melodic minor scale, sixth apart`;
        break;
      case "similar-major":
        exerciseName = `${key} major scale, similar motion`;
        break;
      case "contrary-major":
        exerciseName = `${key} major scale, contrary motion`;
        break;
      case "major-third":
        exerciseName = `${key} major scale, third apart`;
        break;
      case "major-sixth":
        exerciseName = `${key} major scale, sixth apart`;
        break;
      case "major-arpeggio":
        exerciseName = `${key} major arpeggio, hands together`;
        break;
      case "separate-hands-major":
        exerciseName =
          exerciseName = `${key} major scale, ${randomHandGenerator()} hand only`;
        break;
      case "separate-hands-harmonic":
        exerciseName =
          exerciseName = `${key} harmonic minor scale, ${randomHandGenerator()} hand only`;
        break;
      case "separate-hands-major-arpeggio":
        exerciseName =
          exerciseName = `${key} major arpeggio, ${randomHandGenerator()} hand only`;
        break;
      case "separate-hands-minor-arpeggio":
        exerciseName =
          exerciseName = `${key} minor arpeggio, ${randomHandGenerator()} hand only`;
        break;
      default:
        exerciseName = `${key} ${randomScale.type}`;
    }

    // Save separate hand options
    if (
      scaleOption == "separate-hands-major" ||
      scaleOption == "separate-hands-harmonic"
    ) {
      scaleOption = "separate-hands";
    }

    if (
      arpeggioOption == "separate-hands-major-arpeggio" ||
      arpeggioOption == "separate-hands-minor-arpeggio"
    ) {
      arpeggioOption = "separate-hands";
    }

    // Pass data through to webpage
    res.render("scales-helper/index.ejs", {
      randomScale: randomScale,
      showImage: showImage,
      exerciseName: exerciseName,
      arpeggio: arpeggio,
      scale: scale,
      boardOption: boardOption,
      scaleOption: scaleOption,
      arpeggioOption: arpeggioOption,
      gradeOption: gradeOption,
    });
  } else {
    // Issue error message if no results
    res.render("scales-helper/index.ejs", {
      errorMessage: "No scales found. Please check your search parameters.",
    });
  }
});

app.listen(process.env.PORT || port);
