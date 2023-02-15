const mongoose = require("mongoose");

exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_HOST);
    console.log("Success DB Connection");
    return;
  } catch (err) {
    console.log(`Fail DB Connection. error: ${err}`);
  }
};
