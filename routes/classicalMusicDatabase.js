import express from "express";
import axios from "axios";

const router = express.Router();

const API_URL = "https://api.openopus.org";

router.get("/apps/classical-music-database/", async (req, res) => {
  let popular;
  let essential;

  // Load data from API
  try {
    popular = (await axios.get(API_URL + "/composer/list/pop.json")).data;
    essential = (await axios.get(API_URL + "/composer/list/rec.json")).data;
  } catch (error) {
    console.error(error.message);
  }

  res.render("cmd/index.ejs", { popular, essential });
});

router.post("/cmd/submit", (req, res) => {
  let composer;
  try {
    composer = req.body.popular;
  } catch (error) {
    console.error(error.message);
  }
  res.redirect(`biog/${composer}`);
});

router.post("/cmd/submit-essential", (req, res) => {
  let composer;
  try {
    composer = req.body.essential;
  } catch (error) {
    console.error(error.message);
  }
  res.redirect(`biog/${composer}`);
});

router.post("/cmd/search-by-letter", async (req, res) => {
  let searchResults;
  try {
    const letter = req.body.byLetter;
    searchResults = (
      await axios.get(API_URL + `/composer/list/name/${letter}.json`)
    ).data;
  } catch (error) {
    console.error(error.message);
    try {
      const search = req.body.byName;
      searchResults = (
        await axios.get(API_URL + `/composer/list/search/${search}.json`)
      ).data;
    } catch (error) {
      console.error(error.message);
    }
  }
  res.render("cmd/search-results.ejs", { results: searchResults });
});

router.post("/cmd/search-by-period", async (req, res) => {
  let searchResults;
  try {
    const period = req.body.byPeriod;
    searchResults = (
      await axios.get(API_URL + `/composer/list/epoch/${period}.json`)
    ).data;
  } catch (error) {
    console.error(error.message);
  }
  res.render("cmd/search-results.ejs", { results: searchResults });
});

router.post("/cmd/search-by-name", async (req, res) => {
  let searchResults;
  try {
    const name = req.body.byName;
    searchResults = (
      await axios.get(API_URL + `/composer/list/search/${name}.json`)
    ).data;
  } catch (error) {
    console.error(error.message);
  }
  res.render("cmd/search-results.ejs", { results: searchResults });
});

router.get("/cmd/biog/:id", async (req, res) => {
  const composerId = req.params.id;

  var composer = (
    await axios.get(API_URL + `/composer/list/ids/${composerId}.json`)
  ).data.composers[0];
  var mainWorks = (
    await axios.get(
      API_URL + `/work/list/composer/${composerId}/genre/all.json`,
    )
  ).data.works;

  var randomWork = (
    await axios.get(API_URL + "/dyn/work/random?composer=" + composerId)
  ).data.works[0].title;

  res.render("cmd/biog.ejs", {
    composer: composer,
    works: mainWorks,
    randomWork: randomWork,
  });
});

export default router;
