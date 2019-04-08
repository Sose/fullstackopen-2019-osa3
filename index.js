require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

app.use(express.static('build'));
app.use(bodyParser.json());
app.use(cors());

// configuration for morgan logging
morgan.token('requestParams', req => JSON.stringify(req.body));
const morganFormat =
  ':method :url :status :res[content-length] - :response-time ms :requestParams';
app.use(morgan(morganFormat));

app.get('/info', (req, res) => {
  //const numPersons = persons.length;
  Person.find({}).then(persons => {
    const date = new Date(Date.now());
    const numPersons = persons.length;

    res.send(
      `<div>Puhelinluettelossa on ${numPersons} tiedot</div>` +
        `<div>${date}</div>`
    );
  });
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    //console.log('persons', persons)
    res.json(persons.map(p => p.toJSON()));
  });
});

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON());
      } else {
        res.status(404).end();
      }
    })
    .catch(() => {
      res.status(400).send({ error: 'malformatted id' });
    });
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => next(err));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing',
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then(savedPerson => {
      res.json(savedPerson.toJSON());
    })
    .catch(err => next(err));
});

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;
  const id = req.params.id;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing',
    });
  }

  const updatedPerson = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(id, updatedPerson)
    .then(res2 => {
      console.log('find&update', res2);

      const purkkaa = new Person(updatedPerson).toJSON();
      res.json(purkkaa); // TODO: what here??
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
