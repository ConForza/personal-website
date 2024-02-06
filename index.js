import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import axios from 'axios'
import 'dotenv/config'

const app = express()
const port = 3000
const mongoConfig = process.env.MONGO_CONFIG;
const todayDate = new Date().toISOString("en-GB", {timeZone: "Europe/London"})

const minorScales = ["C", "C-sharp", "D", "E-flat", "E", "F", "F-sharp", "G", "G-sharp", "A", "B-flat", "B"]
const majorScales = ["C", "D-flat", "D", "E-flat", "E", "F", "F-sharp", "G", "A-flat", "A", "B-flat", "B"]

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));

await mongoose.connect(mongoConfig)
// await mongoose.connect("mongodb://0.0.0.0:27017/concertsDB")

const repSchema = new mongoose.Schema({
  composer: String,
  work: String
})

const concertSchema = new mongoose.Schema({
  date: Date,
  venue: {type: String, required: true},
  repertoire: {type: [repSchema], required: true},
  notes: String
})

const blogSchema = new mongoose.Schema({
  date: Date,
  title: String,
  content: String,
  archived: Boolean
})

const examboardSchema = new mongoose.Schema({
  board: {type: String, required: true},
  grades: {type: Array, required: true}
})

const scaleSchema = new mongoose.Schema({
  type: String,
  name: String,
  group: String,
  grades: {type: [examboardSchema]},
  link: String
})

const Concert = mongoose.model("Concert", concertSchema)
const Blog = mongoose.model("Blog", blogSchema)
const Scale = mongoose.model("Scale", scaleSchema)

app.get('/', (req, res) => {
  res.render("index.ejs")
})

app.get('/about', (req, res) => {
  res.render("about.ejs", {pageName: "about"})
})

app.get('/concerts', async (req, res) => {
  let concertsList
  let heading
  let link
  if (req.query.past_concerts) {
    concertsList = await Concert.find({date: {$lt: todayDate}}).sort({date: -1})
    heading = "Past Concerts"
    link = '<a class="concert-link" href="/concerts">View upcoming concerts</a>'
  } else {
    concertsList = await Concert.find({date: {$gte: todayDate}}).sort({date: 1})
    heading = "Upcoming Concerts"
    link = '<a class="concert-link" href="/concerts?past_concerts=true">View past concerts</a>'
  }

  res.render("concerts.ejs", {pageName: "concerts", concertsList: concertsList, heading: heading, link: link})
})

app.get('/repertoire', (req, res) => {
  res.render("repertoire.ejs", {pageName: "repertoire"})
})

app.get('/research', (req, res) => {
  res.render("research.ejs", {pageName: "research"})
})

app.get('/blog', async (req, res) => {
  let blogPosts
  let blogsList
  let heading
  let link
  let blogCount
  if (req.query.archived) {
    blogsList = await Blog.find({archived: true}).sort({_id: -1})
    blogCount = blogsList.length
    if (req.query.page) {
      blogPosts = blogsList.splice((req.query.page - 1) * 10, req.query.page * 10)
    } else {
      blogPosts = blogsList.splice(0, 10)
    }
    heading = "Archived Posts"
    link = '<a class="concert-link" href="/blog">View new blogs</a>'
  } else {
    blogsList = await Blog.find({archived: {$ne: true}}).sort({_id: -1})
    blogCount = blogsList.length
    if (req.query.page) {
      blogPosts = blogsList.splice((req.query.page - 1) * 10, req.query.page * 10)
    } else {
      blogPosts = blogsList.splice(0, 10)
    }
    heading = "New Posts"
    link = '<a class="concert-link" href="/blog?archived=true">View archived blog posts</a>'
  }
  res.render("blog.ejs", {pageName: "blog", blogPosts: blogPosts, link: link, heading: heading, blogCount: blogCount, query: req.query})
})

app.get('/posts/:post', async (req, res) => {
  const blogPost = await Blog.findById(req.params.post)
  
  res.render("post.ejs", {pageName: "blog", blogPost: blogPost})
})

app.get('/contact', async (req, res) => {
  res.render("contact.ejs", {pageName: "contact"})
})

app.get('/apps', (req, res) => {
  res.render("apps.ejs", {pageName: "apps"})
})

const API_URL = "https://api.openopus.org"
var searchResults

app.get('/apps/classical-music-database/', async (req, res) => {
  let popular
  let essential

  try {
    popular = (await axios.get(API_URL + "/composer/list/pop.json")).data
    essential = (await axios.get(API_URL + "/composer/list/rec.json")).data
  } catch (error) {
    console.error(error.message)
  }

  res.render("cmd/index.ejs", {popular: popular, essential: essential})
})

app.post("/cmd/submit", (req, res) => {
  let composer
  try {
    composer = req.body.popular
  } catch (error) {
    console.error(error.message)
  }
  res.redirect(`biog/${composer}`)
});

app.post("/cmd/submit-essential", (req, res) => {
  let composer
  try {
    composer = req.body.essential
  } catch (error) {
    console.error(error.message)
  }
  res.redirect(`biog/${composer}`)
})

app.post("/cmd/search-by-letter", async (req, res) => {
  try {
    var letter = req.body.byLetter;
    searchResults = (await axios.get(API_URL + `/composer/list/name/${letter}.json`)).data
  } catch (error) {
    console.error(error.message)
  try {
    var search = req.body.byName
    searchResults = (await axios.get(API_URL + `/composer/list/search/${search}.json`)).data
  } catch (error) {
    console.error(error.message)
  }}
  res.render("cmd/search-results.ejs", {results: searchResults})
})

app.get("/cmd/biog/:id", async (req, res) => {
  const composerId = req.params.id

  var composer = (await axios.get(API_URL + `/composer/list/ids/${composerId}.json`)).data.composers[0]
  var mainWorks = (await axios.get(API_URL + `/work/list/composer/${composerId}/genre/Recommended.json`)).data.works
  var randomWork = (await axios.post(API_URL + "/dyn/work/random?composer=" + composerId)).data["works"][0].title

  res.render("cmd/biog.ejs", {composer: composer, works: mainWorks, random: randomWork})
})

app.get('/apps/scales-helper', async (req, res) => {
  res.render("scales-helper/index.ejs")
})

app.post('/apps/scales-helper', async (req, res) => {
  let showImage = req.body['reveal-hint']
  let arpeggio = req.body['arpeggios']
  let scale = req.body['scales']
  let boardOption = req.body['exam-board']
  let gradeOption = req.body['grade']
  let scaleOption = req.body['scale-options']
  let arpeggioOption = req.body['arpeggio-options']
  let exerciseName

  let query = {}
  if (!((arpeggio == "on") && (scale == "on"))) {
    if (arpeggio == "on") {
      query["group"] = "arpeggios"
      if (!(arpeggioOption == "all")) {
        query["type"] = arpeggioOption
      }
    } else if (scale == "on") {
      query["group"] = "scales"
      if (!(scaleOption == "all")) {
        query["type"] = scaleOption
      }
    }
  } else {
    if (!((arpeggioOption == "all") && (scaleOption == "all"))) {
      if ((!(arpeggioOption == "all")) && ((scaleOption == "all"))) {
        query = {$or: [{"group": "scales"}, {"type": arpeggioOption}]}
      } else if ((!(scaleOption == "all")) && ((arpeggioOption == "all"))) {
        query = {$or: [{"group": "arpeggios"}, {"type": scaleOption}]}
      } else {
        query["type"] = {$in: [arpeggioOption, scaleOption]}
      }
    }
  }
  if (boardOption) {
    query["grades.board"] = boardOption
    if (!(gradeOption == "all")) {
      query["grades.grades"] = gradeOption
    }
  }

  const results = await Scale.find(query)

  if (results.length > 0) {
    const randomScale = results[Math.floor(Math.random() * results.length)]
    let key = randomScale.name

    switch (randomScale.type) {
      case "minor-arpeggio":
        exerciseName = `${key} minor arpeggio`
        break
      case "similar-harmonic":
        exerciseName = `${key} harmonic minor scale, similar motion`
        break
      case "contrary-harmonic":
        exerciseName = `${key} harmonic minor scale, contrary motion`
        break
      case "harmonic-third":
        exerciseName = `${key} harmonic minor scale, third apart`
        break
      case "harmonic-sixth":
        exerciseName = `${key} harmonic minor scale, sixth apart`
        break
      case "similar-melodic":
        exerciseName = `${key} melodic minor scale, similar motion`
        break
      case "melodic-third":
        exerciseName = `${key} melodic minor scale, third apart`
        break
      case "melodic-sixth":
        exerciseName = `${key} melodic minor scale, sixth apart`
        break
      case "similar-major":
        exerciseName = `${key} major scale, similar motion`
        break
      case "contrary-major":
        exerciseName = `${key} major scale, contrary motion`
        break
      case "major-third":
        exerciseName = `${key} major scale, third apart`
        break
      case "major-sixth":
        exerciseName = `${key} major scale, sixth apart`
        break
      case "major-arpeggio":
        exerciseName = `${key} major arpeggio`
        break
      default:
        exerciseName = `${key} ${randomScale.type}`
      }

      res.render("scales-helper/index.ejs", 
        {
          randomScale: randomScale,
          showImage: showImage, 
          exerciseName: exerciseName, 
          arpeggio: arpeggio, 
          scale: scale, 
          boardOption: boardOption, 
          scaleOption: scaleOption, 
          arpeggioOption: arpeggioOption, 
          gradeOption: gradeOption
        })
  } else {
      res.render("scales-helper/index.ejs", {
        errorMessage: "No scales found. Please check your search parameters.",
    })
    }
  })

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})