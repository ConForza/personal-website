import mongoose from "mongoose";

const repSchema = new mongoose.Schema({
  composer: String,
  work: String,
});

const concertSchema = new mongoose.Schema({
  date: Date,
  venue: { type: String, required: true },
  repertoire: { type: [repSchema], required: true },
  notes: String,
});

const Concert = mongoose.model("Concert", concertSchema);

export default Concert;
