const mongoose = require('mongoose')
require('dotenv').config()

//const database_url = "mongodb://127.0.0.1:27017/chatApp";
exports.connect = () => {

  const database_url=process.env.MONGO_URI;
  console.log(database_url);
  mongoose.connect(String(database_url), {
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
