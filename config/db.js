const mongoose = require('mongoose')
require('dotenv').config()

const database_url = process.env.MONGO_URI;
exports.connect = () => {
  mongoose.connect(database_url, {
    useNewUrlPArser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log("DB CONNECTED successfully");
  })
    .catch((error) => {

      console.log("DB connection failure");
      console.log(error);
      process.exit(1);
    })
} 