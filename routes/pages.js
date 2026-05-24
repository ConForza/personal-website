import express from "express";
import { sendEmail } from "../services/emailService.js";

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
