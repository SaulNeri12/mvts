const mongoose = require('mongoose'); 
require('dotenv').config();

const connectDB = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connection URL:", process.env.MONGO_URL);
    console.log('Connection to mongo succesfull');
  } catch (error) {
    console.error('An error has ocured while connecting to mongo:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;