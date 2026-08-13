import express from "express";
import { sendEmail } from "../services/emailService.js";
import Biography, { DEFAULT_PARAGRAPHS } from "../models/Biography.js";
import Repertoire, { DEFAULT_REPERTOIRE } from "../models/Repertoire.js";
import rateLimit from "express-rate-limit";
import { verifyTurnstileToken } from "../services/turnstileService.js";

const router = express.Router();

const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).render("contact.ejs", {
      pageName: "contact",
      error: "Too many messages have been sent. Please try again later.",
      formData: {
        name: req.body?.name,
        email: req.body?.email,
        message: req.body?.message,
      },
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY,
    });
  },
});



router.get("/", (req, res) => {
  res.render("index.ejs");
});

router.get("/about", async (req, res) => {
  try {
    const biography = await Biography.findOneAndUpdate(
      { key: "biography" },
      { $setOnInsert: { paragraphs: DEFAULT_PARAGRAPHS } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.render("about.ejs", {
      pageName: "about",
      paragraphs: biography.paragraphs,
    });
  } catch (error) {
    console.error("Error fetching biography:", error.message);
    res.status(500).send("An error occurred while fetching the biography.");
  }
});

router.get("/repertoire", async (req, res) => {
  try {
    const repertoire = await Repertoire.findOneAndUpdate(
      { key: "repertoire" },
      { $setOnInsert: { categories: DEFAULT_REPERTOIRE } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.render("repertoire.ejs", {
      pageName: "repertoire",
      categories: repertoire.categories,
    });
  } catch (error) {
    console.error("Error fetching repertoire:", error.message);
    res.status(500).send("An error occurred while fetching the repertoire.");
  }
});

router.get("/research", (req, res) => {
  res.render("research.ejs", { pageName: "research" });
});

router.get("/apps", (req, res) => {
  res.render("apps.ejs", { pageName: "apps" });
});

router.get("/contact", (req, res) => {
  res.render("contact.ejs", {
    pageName: "contact",
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY,
  });
});

router.post("/contact", contactRateLimiter, async (req, res) => {
  const { name, email, message, website } = req.body;
  if (website) {
    return res.redirect("/contact");
  }

  if (!name || !email || !message) {
    return res.render("contact.ejs", {
      pageName: "contact",
      error: "Please fill in all required fields.",
      formData: { name, email, message },
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY,
    });
  }

  const isTurnstileValid = await verifyTurnstileToken(
    req.body["cf-turnstile-response"],
    { remoteIp: req.ip },
  );
  if (!isTurnstileValid) {
    return res.render("contact.ejs", {
      pageName: "contact",
      error: "Please complete the security check.",
      formData: { name, email, message },
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY,
    });
  }

  try {
    await sendEmail({ name, email, message });
    res.render("contact.ejs", {
      pageName: "contact",
      successMessage: "Your message has been sent successfully!",
      formData: {},
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.render("contact.ejs", {
      pageName: "contact",
      error:
        "An error occurred while sending your message. Please try again later.",
      formData: { name, email, message },
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY,
    });
  }
});

export default router;
