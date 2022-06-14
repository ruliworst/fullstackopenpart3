const res = require('express/lib/response')
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const personName = process.argv[3]
const phoneNumber = process.argv[4]

const url = `mongodb+srv://ruliworst:${password}@cluster0.fcfoj.mongodb.net/phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)
const argumentsLength = process.argv.length

if(argumentsLength == 3) {
  mongoose
    .connect(url)
    .then(result => {
      Person
        .find({})
        .then(result => {
          console.log('phonebook:')
          result.forEach(person => console.log(person.name, person.number))
          mongoose.connection.close()
        })
    })
    .catch((err) => console.log(err))
}

if(argumentsLength == 5) {
  mongoose
    .connect(url)
    .then(result => {
      const person = new Person({
        name: personName,
        number: phoneNumber
      })

      return person.save()
      .then(result => {
        console.log(`Added ${personName} number ${phoneNumber} to phonebook`)
        mongoose.connection.close()
      })
    })
    .catch((err) => console.log(err))
}