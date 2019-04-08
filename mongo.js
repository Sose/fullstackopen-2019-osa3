const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url =
  `mongodb+srv://fullstack:${password}@cluster0-spubz.mongodb.net/test?retryWrites=true`

mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})
const Person = mongoose.model('Person', personSchema)

if (process.argv.length < 4) {
  // get all persons
  console.log('puhelinluettelo:');
  Person.find({}).then(res => {
    res.forEach(person => {
      console.log(`${person.name} ${person.number}`);
    })

    mongoose.connection.close();
  })

} else if (process.argv.length == 5) {
  // add a new person
  const name = process.argv[3]
  const number = process.argv[4]
  const person = new Person({
    name, number
  })
  
  person.save().then(response => {
    console.log('person saved!');
    mongoose.connection.close();
  })
}


