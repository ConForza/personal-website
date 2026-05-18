import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  date: Date,
  title: String,
  content: String,
  archived: Boolean,
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
