const mongoose = require("mongoose");
require("dotenv").config(); 

// MongoDB 연결
async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI); 
  console.log("MongoDB connected");
}

module.exports = { connectDB };