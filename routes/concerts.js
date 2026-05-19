import express from "express";
import Concert from "../models/Concert.js";

const router = express.Router();

router.get("/concerts", async (req, res) => {
  try {
    const todayDate = new Date().toISOString("en-GB", {
      timeZone: "Europe/London",
    });

    let concertsList;
    let heading;
    let link;
    // Sort concert DB entries into date order, separating upcoming and past ones
    if (req.query.past_concerts) {
      concertsList = await Concert.find({ date: { $lt: todayDate } }).sort({
        date: -1,
      });
      heading = "Past Concerts";
      link =
        '<a class="concert-link" href="/concerts">View upcoming concerts</a>';
    } else {
      concertsList = await Concert.find({ date: { $gte: todayDate } }).sort({
        date: 1,
      });
      heading = "Upcoming Concerts";
      link =
        '<a class="concert-link" href="/concerts?past_concerts=true">View past concerts</a>';
    }

    res.render("concerts.ejs", {
      pageName: "concerts",
      concertsList,
      heading,
      link,
    });
  } catch (error) {
    console.error("Failed to load concerts:", error.message);
    res.status(500).send("An error occurred while loading concerts.");
  }
});

export default router;
