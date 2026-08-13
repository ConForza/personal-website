import express from "express";
import { sendEmail } from "../services/emailService.js";
import Biography, { DEFAULT_PARAGRAPHS } from "../models/Biography.js";

const router = express.Router();

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

router.get("/repertoire", (req, res) => {
  res.render("repertoire.ejs", { pageName: "repertoire" });
});

router.get("/research", (req, res) => {
  res.render("research.ejs", { pageName: "research" });
});

router.get("/apps", (req, res) => {
  res.render("apps.ejs", { pageName: "apps" });
});

router.get("/contact", (req, res) => {
  res.render("contact.ejs", { pageName: "contact" });
});

router.post("/contact", async (req, res) => {
  const { name, email, message, website } = req.body;
  if (website) {
    return res.redirect("/contact");
  }

  if (!name || !email || !message) {
    return res.render("contact.ejs", {
      pageName: "contact",
      error: "Please fill in all required fields.",
      formData: { name, email, message },
    });
  }

  try {
    await sendEmail({ name, email, message });
    res.render("contact.ejs", {
      pageName: "contact",
      successMessage: "Your message has been sent successfully!",
      formData: {},
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.render("contact.ejs", {
      pageName: "contact",
      error:
        "An error occurred while sending your message. Please try again later.",
      formData: { name, email, message },
    });
  }
});

export default router;
