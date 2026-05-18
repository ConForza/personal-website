import mongoose from "mongoose";

const examboardSchema = new mongoose.Schema({
  board: { type: String, required: true },
  grades: { type: Array, required: true },
});

const scaleSchema = new mongoose.Schema({
  type: String,
  name: String,
  group: String,
  grades: { type: [examboardSchema] },
  link: String,
});

const Scale = mongoose.model("Scale", scaleSchema);

export default Scale;
