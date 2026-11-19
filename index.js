const express = require("express");
const morgan = require("morgan");
const app = express();
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
  res.json(phonebooks);
});
// Step 2
app.get("/info", (req, res) => {
  const nthPeople = String(phonebooks.length);
  const dateNow = new Date().toString();
  res.status(200).send(`
      <p>Phonebook has info for ${nthPeople} people</p>
      <p>${dateNow}</p>
      `);
});
// Step 3
app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const person = phonebooks.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
  // console.log("Found person", person);
  // console.log(req.params.id);
});
// Step 4
app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  phonebooks = phonebooks.filter((person) => person.id !== id);
  res.status(204).end();
});
const generateId = () => {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
  const id = String(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
  return id;
};
// Step 5
app.post("/api/persons", (req, res) => {
  const body = req.body;
  const existsPerson = phonebooks.find(
    (person) => person.name.toLowerCase() === req.body.name.toLowerCase(),
  );
  // Step 6
  if (!body.name || !body.number) {
    return res
      .status(400)
      .json({ error: "Both name and number must be included" });
  } else if (existsPerson) {
    return res.status(400).json({ error: "Name must be unique" });
  }

  const personDetails = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };
  // console.log(personDetails);
  // res.status(201).end("success");
  phonebooks.concat(personDetails);
  res.status(201).json(personDetails);
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
