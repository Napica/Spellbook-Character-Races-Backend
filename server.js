require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Race = require("./models/Race");
const axios = require("axios");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/spellbook-race-db",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("Mongoose successfully connected.");
});

connection.on("error", (err) => {
  console.log("Mongoose connection error: ", err);
});

app.get("/api/config", (req, res) => {
  res.json({
    success: true,
  });
});

app.get("/", async (req, res) => {
  const raceArr = await axios.get(`https://www.dnd5eapi.co/api/races/`);
  // console.log(raceArr);
  raceArr.data.results.forEach(async (races) => {
    const raceSetter = await Race.findOne({ name: races.name });
    if (raceSetter === null) {
      await Race.create({ name: races.name }).then((r) => {
        r.index = races.index;
        r.url = races.url;
        r.save();
      });
    }
  });
});

app.get("/race", async (req, res) => {
  const name = await Race.find();
  // console.log(name)
  res.json({ name });
});

app.get("/raceNames", async (req, res) => {
  const racesTypes = await Race.find();
  const CharacterRaces = racesTypes.map(async (races) => {
    const item = await axios.get(
      `https://www.dnd5eapi.co/api/races/${races.index}`
    );
    return item.data;
  });
  Promise.all(CharacterRaces).then((results) => {
    res.json({ results });
  });
});

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
