import mongoose from "mongoose";

export const DEFAULT_REPERTOIRE = [
  {
    title: "Concerto",
    items: [
      {
        composer: "",
        works: [
          "Beethoven Piano Concerto No. 1 in C major",
          "Beethoven Piano Concerto No. 3 in C minor",
          "Beethoven “Triple” Concerto",
          "Beethoven Choral Fantasy",
          "Grieg Piano Concerto",
          "Prokofiev Piano Concerto No. 3 in C major",
          "Schumann Piano Concerto",
        ],
      },
    ],
  },
  {
    title: "Recital",
    items: [
      { composer: "J.S. Bach", works: ["Partitas 1, 2 and 6", "Selection of preludes and fugues"] },
      {
        composer: "Ludwig van Beethoven",
        works: [
          "Sonata in F minor op. 2 no. 1",
          "Sonata in A major op. 2 no. 2",
          "Sonata in C major op. 2 no. 3",
          "Sonata in F major op. 10 no. 2",
          "Sonata in E major op. 14 no. 1",
          "Sonata in G major op. 14 no. 2",
          "Sonata in B flat op. 22",
          "“Moonlight” Sonata in C Sharp Minor, op. 27 no. 2",
          "Sonata in A flat major, op. 26",
          "\"Waldstein\" Sonata in C major, op. 53",
          "“Appassionata” Sonata in F minor, op. 57",
          "Bagatelles, op. 126",
        ],
      },
      { composer: "Alban Berg", works: ["Sonata, op. 1"] },
      {
        composer: "Fryderyk Chopin",
        works: [
          "Sonata in B minor op. 58",
          "Ballade in G minor, op. 23",
          "Ballade in F major, op. 38",
          "Preludes, nocturnes, études, mazurkas, and waltzes (selections)",
        ],
      },
      { composer: "Claude Debussy", works: ["Selection of preludes"] },
      { composer: "Edvard Grieg", works: ["Sonata in E minor, op. 7"] },
      {
        composer: "Joseph Haydn",
        works: ["Sonata in C major, Hob XVI:50", "Variations in F minor, Hob XVII:6"],
      },
      { composer: "Felix Mendelssohn", works: ["Variations sérieuses, op. 54"] },
      { composer: "Olivier Messiaen", works: ["Préludes"] },
      {
        composer: "Wolfgang Amadeus Mozart",
        works: ["Fantasia in D minor, K. 397", "Sonata in A minor, K. 310"],
      },
      { composer: "Modest Mussorgsky", works: ["Pictures at an Exhibition"] },
      { composer: "Helen Perkin", works: ["Preludes"] },
      {
        composer: "Serge Prokofiev",
        works: [
          "Sonata no. 2 in D minor",
          "Sonata no. 4 in C minor",
          "Sonata no. 5 in C major",
          "Sonata no. 7 in B flat major",
          "Sonata no. 8 in B flat major",
          "Selection of Visions fugitives, op. 22",
          "Tales of an Old Grandmother, op. 31",
        ],
      },
      {
        composer: "Sergei Rachmaninov",
        works: ["Corelli variations", "Selection of preludes"],
      },
      { composer: "Maurice Ravel", works: ["Sonatine"] },
      { composer: "Domenico Scarlatti", works: ["Selection of sonatas"] },
      {
        composer: "Robert Schumann",
        works: [
          "Papillons, op. 11",
          "Études symphoniques, op. 13",
          "Fantasiestücke, op. 12",
          "Kreisleriana, op. 16",
          "Arabeske in C, op. 18",
        ],
      },
      { composer: "Franz Schubert", works: ["Impromptus, Op. 90, D. 899"] },
      { composer: "Dmitri Shostakovich", works: ["Selection of preludes and fugues"] },
    ],
  },
];

const itemSchema = new mongoose.Schema(
  {
    composer: { type: String, default: "" },
    works: { type: [String], required: true },
  },
  { _id: false },
);

const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    items: { type: [itemSchema], required: true },
  },
  { _id: false },
);

const repertoireSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "repertoire",
    },
    categories: {
      type: [categorySchema],
      required: true,
      default: DEFAULT_REPERTOIRE,
    },
  },
  { timestamps: true },
);

const Repertoire = mongoose.model("Repertoire", repertoireSchema);

export default Repertoire;
