import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

router.get("/blog", async (req, res) => {
  let blogPosts;
  let blogsList;
  let heading;
  let link;
  let blogCount;
  // Archived blog previews, sorted by newest first. Separate into 10 entries per page
  if (req.query.archived) {
    blogsList = await Blog.find({ archived: true }).sort({ _id: -1 });
    blogCount = blogsList.length;
    // Load selected page
    if (req.query.page) {
      blogPosts = blogsList.splice(
        (req.query.page - 1) * 10,
        req.query.page * 10,
      );
    } else {
      blogPosts = blogsList.splice(0, 10);
    }
    heading = "Archived Posts";
    link = '<a class="concert-link" href="/blog">View new blogs</a>';
  } else {
    // New blog post previews
    blogsList = await Blog.find({ archived: { $ne: true } }).sort({ _id: -1 });
    blogCount = blogsList.length;
    if (req.query.page) {
      blogPosts = blogsList.splice(
        (req.query.page - 1) * 10,
        req.query.page * 10,
      );
    } else {
      blogPosts = blogsList.splice(0, 10);
    }
    heading = "New Posts";
    link =
      '<a class="concert-link" href="/blog?archived=true">View archived blog posts</a>';
  }
  res.render("blog.ejs", {
    pageName: "blog",
    blogPosts,
    link,
    heading,
    blogCount,
    query: req.query,
  });
});

// Route for full-page blog post
router.get("/posts/:post", async (req, res) => {
  const blogPost = await Blog.findById(req.params.post);

  res.render("post.ejs", { pageName: "blog", blogPost });
});

export default router;
