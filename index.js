const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const morgan = require('morgan')

app.use(bodyParser.json())

// configuration for morgan logging
morgan.token('requestParams', (req) => JSON.stringify(req.body))
const morganFormat = ':method :url :status :res[content-length] - :response-time ms :requestParams'
app.use(morgan(morganFormat))

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1,
  },
  {
    name: 'Martti Tienari',
    number: '040-123456',
    id: 2,
  },
  {
    name: 'Arto Järvinen',
    number: '040-123456',
    id: 3,
  },
  {
    name: 'Lea Kutvonen',
    number: '040-123456',
    id: 4,
  },
];

app.get('/', (req, res) => {
  res.send('<h1>Hello world!</h1>');
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/info', (req, res) => {
  const numPersons = persons.length;
  const date = new Date(Date.now());
  res.send(
    `<div>Puhelinluettelossa on ${numPersons} tiedot</div>` +
    `<div>${date}</div>`
  );
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(p => p.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)
  res.status(204).end()
  console.log(`deleted id ${id}`)
})

const generateId = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

app.post('/api/persons', (req, res) => {
  const body = req.body;
  const id = generateId();

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing'
    })
  }

  const found = persons.find(p => p.name === body.name);

  if (found) {
    return res.status(400).json({
      error: `person ${found.name} already exists`
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  res.json(person)
})

const PORT = 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
