import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

router.get("/blog", async (req, res) => {
  try {
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
      blogsList = await Blog.find({ archived: { $ne: true } }).sort({
        _id: -1,
      });
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
  } catch (error) {
    console.error("Failed to load blog posts:", error.message);
    res.status(500).send("An error occurred while loading blog posts.");
  }
});

// Route for full-page blog post
router.get("/posts/:post", async (req, res) => {
  try {
    const blogPost = await Blog.findById(req.params.post);

    if (!blogPost) {
      return res.status(404).send("Blog post not found.");
    }

    res.render("post.ejs", { pageName: "blog", blogPost });
  } catch (error) {
    console.error("Failed to load blog post:", error.message);
    res.status(500).send("An error occurred while loading the blog post.");
  }
});

export default router;
