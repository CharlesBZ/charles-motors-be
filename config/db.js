const mongoose = require("mongoose")
const config = require("config")
const db = config.get("mongoURI")

const connectDB = async () => {
  try {
    mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("Connected to Motorcycles MongoDB")
  } catch (err) {
    console.error(err.message)
    //Exit process with failure
    process.exit(1)
  }
}

module.exports = connectDB
