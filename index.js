require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
const unknownEndpoint = require('./middleware/unknownEndpoint')
const errorHandler = require('./middleware/errorHandler')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', (req, res) => {
  const body = req.body
  return JSON.stringify(body)
})

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => { 
  Person.count({}).then(count => 
    response.send(`<p>Phonebook has info for ${count} people<p><p>${new Date()}</p>`))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if(person) {
      response.json(person)
    } else {
      response.status(404).end() 
    }
  })
  .catch(error => {
    next(error)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id).then(result => {
    response.status(204).end()
  })
  .catch(error => { next(error) })
})

app.put('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndUpdate(
    request.params.id,
     request.body,
    { new: true, runValidators: true, context: 'query' })
    .then(result => { response.send(result)})
    .catch(error => { next(error)})
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if(!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  Person.find({name: body.name})
  .then(result => {
    if (result.length > 0) {
      return response.status(400).json({
        error: 'name must be unique'
      })
    }

    const person = new Person({
      name: body.name,
      number: body.number
    })

    person.save().then(result => {
      response.send(result)
    })
    .catch(error => {
      return next(error)
    })
  })
  .catch(error => next(error)) 
})

app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log('Server running on PORT', PORT)
})