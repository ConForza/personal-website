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
import scalesHelperRoutes from "./routes/scalesHelper.js";
import adminRoutes from "./routes/admin.js";

// Express setup

const app = express();
const port = process.env.PORT || 3000;
const mongoConfig = process.env.MONGO_CONFIG;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/", pageRoutes);
app.use("/", concertRoutes);
app.use("/", blogRoutes);
app.use("/", classicalMusicDatabaseRoutes);
app.use("/", scalesHelperRoutes);
app.use("/", adminRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).render("404.ejs");
});

// Connect to MongoDB and start server

await mongoose.connect(mongoConfig);
// Option for local MongoDB:
// await mongoose.connect("mongodb://0.0.0.0:27017/concertsDB")

app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on port ${port}`);
});
