import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import nodemailer from 'nodemailer'
import axios from 'axios'
// import 'dotenv/config'

const app = express()
const port = 3000
const mongoConfig = process.env.MONGO_CONFIG;
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;
const todayDate = new Date().toISOString("en-GB", {timeZone: "Europe/London"})
var transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  auth: {
      user: emailUser,
      pass: emailPassword
  }
})

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));

await mongoose.connect(mongoConfig)

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

const Concert = mongoose.model("Concert", concertSchema)
const Blog = mongoose.model("Blog", blogSchema)

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
  let archived = false
  if (req.query.archived) {
    archived = true
    blogsList = await Blog.find({archived: true}).sort({date: -1})
    blogCount = blogsList.length
    if (req.query.page) {
      blogPosts = blogsList.splice((req.query.page - 1) * 10, req.query.page * 10)
    } else {
      blogPosts = blogsList.splice(0, 10)
    }
    heading = "Archived Posts"
    link = '<a class="concert-link" href="/blog">View new blogs</a>'
  } else {
    blogsList = await Blog.find({archived: {$ne: true}}).sort({date: -1})
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

app.post('/contact', async (req, res) => {
  const emailTo = req.body.email
  const subject = req.body.subject
  const message = req.body.message

  async function main() {
    const info = await transporter.sendMail({
      from: `Gary O'Shea <gary@garyoshea.co.uk>`,
      to: `gary@garyoshea.co.uk, ${emailTo}`,
      subject: "Thank you for emailing garyoshea.co.uk",
      text: 
`Form submission to garyoshea.co.uk.

Email from: ${emailTo}
Subject: ${subject}

Message:
${message}`

    })
  }
  
  main().catch(console.error);


  res.render("contact.ejs", {confirmation: "Message sent!", pageName: "contact"})
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
  let composer;
  try {
    composer = req.body.popular
  } catch (error) {
    console.error(error.message)
  }
  res.redirect(`biog/${composer}`)
});

app.post("/cmd/submit-essential", (req, res) => {
  let composer;
  try {
    composer = req.body.essential
  } catch (error) {
    console.error(error.message)
  }
  res.redirect(`biog/${composer}`)
});

app.post("/cmd/search-by-letter", async (req, res) => {
  try {
    var letter = req.body.byLetter;
    searchResults = (await axios.get(API_URL + `/composer/list/name/${letter}.json`)).data
  } catch (error) {
    console.error(error.message)
  }

  res.render("cmd/search-results.ejs", {results: searchResults})
});

app.post("/cmd/search-by-period", async (req, res) => {
  try {
    var period = req.body.byPeriod
    searchResults = (await axios.get(API_URL + `/composer/list/epoch/${period}.json`)).data
  } catch (error) {
    console.error(error.message)
  }

  res.render("cmd/search-results.ejs", {results: searchResults})
});

app.post("/cmd/search", async (req, res) => {
  try {
    var search = req.body.byName
    searchResults = (await axios.get(API_URL + `/composer/list/search/${search}.json`)).data
  } catch (error) {
    console.error(error.message)
  }

  res.render("cmd/search-results.ejs", {results: searchResults})
});

app.get("/cmd/biog/:id", async (req, res) => {
  const composerId = req.params.id

  var composer = (await axios.get(API_URL + `/composer/list/ids/${composerId}.json`)).data.composers[0]
  var mainWorks = (await axios.get(API_URL + `/work/list/composer/${composerId}/genre/Recommended.json`)).data.works
  var randomWork = (await axios.post(API_URL + "/dyn/work/random?composer=" + composerId)).data["works"][0].title

  res.render("cmd/biog.ejs", {composer: composer, works: mainWorks, random: randomWork})
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})