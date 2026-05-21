import express from "express";

const router = express.Router();

router.get("/admin/login", (req, res) => {
  res.render("admin/login.ejs", { error: null });
});

router.get("/admin", (req, res) => {
  res.render("admin/dashboard.ejs");
});

export default router;
