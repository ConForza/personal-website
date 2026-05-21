import express from "express";

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.session.isAdmin) {
    return next();
  }
  res.redirect("/admin/login");
}

router.get("/admin/login", (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect("/admin");
  }

  res.render("admin/login.ejs", { error: null });
});

router.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  const isValidAdmin =
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD;

  if (!isValidAdmin) {
    return res
      .status(401)
      .render("admin/login.ejs", { error: "Invalid username or password." });
  }

  req.session.isAdmin = true;

  res.redirect("/admin");
});

router.post("/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Failed to log out:", err.message);
      return res.status(500).send("An error occurred while logging out.");
    }
    res.redirect("/admin/login");
  });
});

router.get("/admin", requireAdmin, (req, res) => {
  res.render("admin/dashboard.ejs");
});

export default router;
