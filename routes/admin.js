import express from "express";
import Blog from "../models/Blog.js";

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

router.get("/admin/posts", requireAdmin, async (req, res) => {
  try {
    const posts = await Blog.find().sort({ _id: -1 });
    res.render("admin/posts.ejs", { posts });
  } catch (error) {
    console.error("Error fetching blog posts:", error.message);
    res.status(500).send("An error occurred while fetching blog posts.");
  }
});

router.get("/admin/posts/new", requireAdmin, (req, res) => {
  res.render("admin/post-form.ejs", {
    formTitle: "Create New Blog Post",
    action: "/admin/posts",
    post: {
      title: "",
      date: "",
      content: "",
      archived: false,
    },
    error: null,
  });
});

router.post("/admin/posts", requireAdmin, async (req, res) => {
  try {
    const { title, date, content, archived } = req.body;
    if (!title || !content) {
      return res.status(400).render("admin/post-form.ejs", {
        formTitle: "Create New Blog Post",
        action: "/admin/posts",
        post: { title, date, content, archived: archived === "on" },
        error: "Title and content are required.",
      });
    }

    await Blog.create({
      title,
      date,
      content,
      archived: archived === "on",
    });

    res.redirect("/admin/posts");
  } catch (error) {
    console.error("Error creating blog post:", error.message);
    res.status(500).send("An error occurred while creating the blog post.");
  }
});

export default router;
