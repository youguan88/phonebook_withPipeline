/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');

const { MONGODB_URI } = process.env;

mongoose.set('strictQuery', false);

console.log('connecting to', MONGODB_URI);
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
    throw error;
  });

const personSchema = new mongoose.Schema({
  id: Number,
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: (value) => /^(\d{2}|\d{3})(-)(\d+)$/.test(value),
      message: 'Invalid phone number input',
    },
    required: true,
    minLength: 9,
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
