import express from "express";
import Blog from "../models/Blog.js";
import Biography, { DEFAULT_PARAGRAPHS } from "../models/Biography.js";
import Repertoire, { DEFAULT_REPERTOIRE } from "../models/Repertoire.js";
import Concert from "../models/Concert.js";
import bcrypt from "bcrypt";

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

function setFlashMessage(req, message) {
  req.session.flashMessage = message;
}

function getFlashMessage(req) {
  const message = req.session.flashMessage;
  delete req.session.flashMessage;
  return message;
}

router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const isValidAdmin =
    username === process.env.ADMIN_USERNAME &&
    (await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH));

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


router.get("/admin/biography", requireAdmin, async (req, res) => {
  try {
    const biography = await Biography.findOneAndUpdate(
      { key: "biography" },
      { $setOnInsert: { paragraphs: DEFAULT_PARAGRAPHS } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.render("admin/biography-form.ejs", {
      paragraphs: biography.paragraphs,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching biography:", error.message);
    res.status(500).send("An error occurred while fetching the biography.");
  }
});

router.post("/admin/biography", requireAdmin, async (req, res) => {
  try {
    const submittedParagraphs = Array.isArray(req.body.paragraphs)
      ? req.body.paragraphs
      : [req.body.paragraphs];
    const paragraphs = submittedParagraphs
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      return res.status(400).render("admin/biography-form.ejs", {
        paragraphs: submittedParagraphs,
        error: "At least one biography paragraph is required.",
      });
    }

    await Biography.findOneAndUpdate(
      { key: "biography" },
      { paragraphs },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    setFlashMessage(req, "Biography updated successfully.");
    res.redirect("/admin/biography");
  } catch (error) {
    console.error("Error updating biography:", error.message);
    res.status(500).send("An error occurred while updating the biography.");
  }
});


router.get("/admin/repertoire", requireAdmin, async (req, res) => {
  try {
    const repertoire = await Repertoire.findOneAndUpdate(
      { key: "repertoire" },
      { $setOnInsert: { categories: DEFAULT_REPERTOIRE } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.render("admin/repertoire-form.ejs", {
      categories: repertoire.categories,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching repertoire:", error.message);
    res.status(500).send("An error occurred while fetching the repertoire.");
  }
});

router.post("/admin/repertoire", requireAdmin, async (req, res) => {
  try {
    const submittedCategories = Array.isArray(req.body.categories)
      ? req.body.categories
      : [req.body.categories];
    const categories = submittedCategories
      .filter(Boolean)
      .map((category) => ({
        title: (category.title || "").trim(),
        items: (Array.isArray(category.items) ? category.items : [category.items])
          .filter(Boolean)
          .map((item) => ({
            composer: (item.composer || "").trim(),
            works: (item.works || "")
              .split("\n")
              .map((work) => work.trim())
              .filter(Boolean),
          }))
          .filter((item) => item.works.length > 0),
      }))
      .filter((category) => category.title && category.items.length > 0);

    if (categories.length === 0) {
      return res.status(400).render("admin/repertoire-form.ejs", {
        categories: submittedCategories,
        error: "At least one repertoire section with a work is required.",
      });
    }

    await Repertoire.findOneAndUpdate(
      { key: "repertoire" },
      { categories },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    setFlashMessage(req, "Repertoire updated successfully.");
    res.redirect("/admin/repertoire");
  } catch (error) {
    console.error("Error updating repertoire:", error.message);
    res.status(500).send("An error occurred while updating the repertoire.");
  }
});


function parseConcertRepertoire(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf("|");
      if (separatorIndex === -1) {
        return { composer: "", work: line };
      }
      return {
        composer: line.slice(0, separatorIndex).trim(),
        work: line.slice(separatorIndex + 1).trim(),
      };
    })
    .filter((work) => work.work);
}

function renderConcertForm(res, options) {
  res.render("admin/concert-form.ejs", {
    formTitle: options.formTitle,
    action: options.action,
    concert: options.concert,
    dateValue: options.dateValue,
    error: options.error,
  });
}

router.get("/admin/concerts", requireAdmin, async (req, res) => {
  try {
    const concerts = await Concert.find().sort({ date: -1 });
    res.render("admin/concerts.ejs", {
      concerts,
      flashMessage: getFlashMessage(req),
    });
  } catch (error) {
    console.error("Error fetching concerts:", error.message);
    res.status(500).send("An error occurred while fetching concerts.");
  }
});

router.get("/admin/concerts/new", requireAdmin, (req, res) => {
  renderConcertForm(res, {
    formTitle: "Add Concert",
    action: "/admin/concerts",
    concert: { venue: "", notes: "", repertoire: [] },
    dateValue: "",
    error: null,
  });
});

router.post("/admin/concerts", requireAdmin, async (req, res) => {
  try {
    const { date, venue, notes } = req.body;
    const repertoire = parseConcertRepertoire(req.body.repertoire);
    const parsedDate = new Date(date);

    if (!venue || !date || Number.isNaN(parsedDate.getTime())) {
      return res.status(400).render("admin/concert-form.ejs", {
        formTitle: "Add Concert",
        action: "/admin/concerts",
        concert: { venue, notes, repertoire },
        dateValue: date || "",
        error: "A valid date and venue are required.",
      });
    }

    await Concert.create({ date: parsedDate, venue, notes, repertoire });
    setFlashMessage(req, "Concert created successfully.");
    res.redirect("/admin/concerts");
  } catch (error) {
    console.error("Error creating concert:", error.message);
    res.status(500).send("An error occurred while creating the concert.");
  }
});

router.get("/admin/concerts/:id/edit", requireAdmin, async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id);
    if (!concert) {
      return res.status(404).send("Concert not found.");
    }

    renderConcertForm(res, {
      formTitle: "Edit Concert",
      action: `/admin/concerts/${concert._id}/edit`,
      concert,
      dateValue: new Date(concert.date).toISOString().slice(0, 16),
      error: null,
    });
  } catch (error) {
    console.error("Error fetching concert:", error.message);
    res.status(500).send("An error occurred while fetching the concert.");
  }
});

router.post("/admin/concerts/:id/edit", requireAdmin, async (req, res) => {
  try {
    const { date, venue, notes } = req.body;
    const repertoire = parseConcertRepertoire(req.body.repertoire);
    const parsedDate = new Date(date);

    if (!venue || !date || Number.isNaN(parsedDate.getTime())) {
      return res.status(400).render("admin/concert-form.ejs", {
        formTitle: "Edit Concert",
        action: `/admin/concerts/${req.params.id}/edit`,
        concert: { venue, notes, repertoire },
        dateValue: date || "",
        error: "A valid date and venue are required.",
      });
    }

    const updatedConcert = await Concert.findByIdAndUpdate(
      req.params.id,
      { date: parsedDate, venue, notes, repertoire },
      { new: true, runValidators: true },
    );
    if (!updatedConcert) {
      return res.status(404).send("Concert not found.");
    }

    setFlashMessage(req, "Concert updated successfully.");
    res.redirect("/admin/concerts");
  } catch (error) {
    console.error("Error updating concert:", error.message);
    res.status(500).send("An error occurred while updating the concert.");
  }
});

router.post("/admin/concerts/:id/delete", requireAdmin, async (req, res) => {
  try {
    const deletedConcert = await Concert.findByIdAndDelete(req.params.id);
    if (!deletedConcert) {
      return res.status(404).send("Concert not found.");
    }

    setFlashMessage(req, "Concert deleted successfully.");
    res.redirect("/admin/concerts");
  } catch (error) {
    console.error("Error deleting concert:", error.message);
    res.status(500).send("An error occurred while deleting the concert.");
  }
});

router.get("/admin/posts", requireAdmin, async (req, res) => {
  try {
    const posts = await Blog.find().sort({ _id: -1 });
    res.render("admin/posts.ejs", {
      posts,
      flashMessage: getFlashMessage(req),
    });
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

    setFlashMessage(req, "Blog post created successfully.");
    res.redirect("/admin/posts");
  } catch (error) {
    console.error("Error creating blog post:", error.message);
    res.status(500).send("An error occurred while creating the blog post.");
  }
});

router.get("/admin/posts/:id/edit", requireAdmin, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Blog post not found.");
    }

    res.render("admin/post-form.ejs", {
      formTitle: "Edit Blog Post",
      action: `/admin/posts/${post._id}/edit`,
      post,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching blog post:", error.message);
    res.status(500).send("An error occurred while fetching the blog post.");
  }
});

router.post("/admin/posts/:id/edit", requireAdmin, async (req, res) => {
  try {
    const { title, date, content, archived } = req.body;
    if (!title || !content) {
      return res.status(400).render("admin/post-form.ejs", {
        formTitle: "Edit Blog Post",
        action: `/admin/posts/${req.params.id}/edit`,
        post: {
          _id: req.params.id,
          title,
          date,
          content,
          archived: archived === "on",
        },
        error: "Title and content are required.",
      });
    }
    const updatedPost = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        date,
        content,
        archived: archived === "on",
      },
      { new: true },
    );

    if (!updatedPost) {
      return res.status(404).send("Blog post not found.");
    }

    setFlashMessage(req, "Blog post updated successfully.");
    res.redirect("/admin/posts");
  } catch (error) {
    console.error("Error updating blog post:", error.message);
    res.status(500).send("An error occurred while updating the blog post.");
  }
});

router.post("/admin/posts/:id/archive", requireAdmin, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Blog post not found.");
    }

    post.archived = !post.archived;
    await post.save();

    setFlashMessage(
      req,
      `Blog post ${post.archived ? "archived" : "unarchived"} successfully.`,
    );
    res.redirect("/admin/posts");
  } catch (error) {
    console.error("Error archiving blog post:", error.message);
    res.status(500).send("An error occurred while archiving the blog post.");
  }
});

router.post("/admin/posts/:id/delete", requireAdmin, async (req, res) => {
  try {
    const deletedPost = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).send("Blog post not found.");
    }

    if (!deletedPost.archived) {
      setFlashMessage(req, "Only archived posts can be deleted.");
      return res.redirect("/admin/posts");
    }

    await Blog.findByIdAndDelete(req.params.id);

    setFlashMessage(req, "Blog post deleted successfully.");
    res.redirect("/admin/posts");
  } catch (error) {
    console.error("Error deleting blog post:", error.message);
    res.status(500).send("An error occurred while deleting the blog post.");
  }
});

export default router;
