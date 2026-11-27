require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const Person = require("./modules/person");
morgan.token("body", (req, res) => req.body);
app.use(express.json());
app.use(express.static("dist"));
app.use(
  /* morgan(":method :url :status :res[content-length] - :response-time ms :body"), */
  // https://github.com/expressjs/morgan#using-a-custom-format-function
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(tokens.body(req, res)),
    ].join(" ");
  }),
);
let phonebooks = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];
app.get("/", (req, res) => {
  res.send("<h1>Phonebook app</h1>");
});
app.get("/api/persons", (req, res) => {
  // Exercise 3.13 - fetching all of phonebook entries from the database
  Person.find({}).then((result) => res.json(result));
});
// Step 2
app.get("/info", (req, res, next) => {
  Person.countDocuments({})
    .then((sum) => {
      console.log("Sum is:", sum);
      res.status(200).send(`
      <p>Phonebook has info for ${sum} people</p>
      <p>${new Date()}</p>
      `);
    })
    .catch((error) => next(error));
});
// Step 3
app.get("/api/persons/:id", (req, res, next) => {
  // const id = req.params.id;
  Person.findById(req.params.id)
    .then((returnedPerson) => {
      console.log("Returned single person:", returnedPerson);
      if (returnedPerson) {
        res.json(returnedPerson);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
  /* const person = phonebooks.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  } */
  // console.log("Found person", person);
  // console.log(req.params.id);
});
// Step 4
app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      console.log("Data deleted:", result);
      res.status(204).end();
    })
    .catch((error) => next(error));
  /*  const id = req.params.id;
  phonebooks = phonebooks.filter((person) => person.id !== id);
  res.status(204).end(); */
});
const generateId = () => {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
  const id = String(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
  return id;
};
// Step 5
app.post("/api/persons", (req, res, next) => {
  const body = req.body;
  // Step 6
  if (!body.name || !body.number) {
    return res
      .status(400)
      .json({ error: "Both name and number must be included" });
  }

  // Exercise 3.14 - Add person to the database
  const personDetails = new Person({
    name: body.name,
    number: body.number,
  });
  personDetails.save().then((result) => res.status(201).json(result));
});
app.put("/api/persons/:id", (req, res, next) => {
  console.log("Caught req body", req.body);
  const { number } = req.body;
  Person.findByIdAndUpdate(req.params.id).then((returnedPerson) => {
    console.log("Found RETURNED PERSON:", returnedPerson);
    returnedPerson.number = number;
    returnedPerson.save().then((updatedData) => res.json(updatedData));
    // next();
  });
});
const errorHandler = (err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).end({ error: "malformed id" });
  }
  next(err);
};
app.use(errorHandler);
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
