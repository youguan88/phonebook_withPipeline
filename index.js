const express = require('express');
const morgan = require('morgan');

morgan.token('body', (req) => JSON.stringify(req.body));
const cors = require('cors');

const app = express();
require('dotenv').config();
const Person = require('./models/person');

app
  .use(express.static('./frontend/dist'))
  .use(cors())
  .use(express.json())
  .use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.get('/info', (request, response, next) => {
  Person.find({}).then((persons) => {
    const timenow = new Date();
    const info = `
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${timenow}</p>
        `;
    response.send(info);
  })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const person = request.body;
  const newPerson = new Person({
    name: person.name,
    number: person.number,
  });

  newPerson.save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;
  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' },
  )
    .then((updatedPerson) => { response.json(updatedPerson); })
    .catch((error) => next(error));
});

// eslint-disable-next-line consistent-return
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
