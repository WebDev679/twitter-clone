const monk = require("monk");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Filter = require("bad-words");
const rateLimit = require("express-rate-limit");

const app = express();

const db = monk(process.env.MONGO_URI);
const mews = db.get("mews");
const filter = new Filter();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

const isValidMew = (mew) => {
  return (
    mew.name &&
    mew.name.toString().trim() != "" &&
    mew.content &&
    mew.content.toString().trim() != ""
  );
};

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Meower!",
  });
});

app.get("/mews", (req, res) => {
  mews.find().then((mews) => {
    res.status(200).json(mews);
  });
});

app.post("/mews", (req, res) => {
  if (isValidMew(req.body)) {
    const mew = {
      name: filter.clean(req.body.name.toString()),
      content: filter.clean(req.body.content.toString()),
      created: new Date(),
    };
    console.log(mew);
    mews.insert(mew).then((createdMew) => {
      res.json(createdMew);
    });
  } else {
    res.status(422).json({
      message: "Hey! Name and Content are required",
    });
  }
});

app.listen(8000, () => {
  console.log("Listening on port 8000...");
});
