import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("index.ejs");
});

router.get("/about", (req, res) => {
  res.render("about.ejs", { pageName: "about" });
});

router.get("/repertoire", (req, res) => {
  res.render("repertoire.ejs", { pageName: "repertoire" });
});

router.get("/research", (req, res) => {
  res.render("research.ejs", { pageName: "research" });
});

router.get("/contact", (req, res) => {
  res.render("contact.ejs", { pageName: "contact" });
});

router.get("/apps", (req, res) => {
  res.render("apps.ejs", { pageName: "apps" });
});

export default router;
