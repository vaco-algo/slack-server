const mongoose = require("mongoose");

exports.connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true });
    console.log("Success DB Connection");
    return;
  } catch (err) {
    console.log(`Fail DB Connection. error: ${err}`);
  }
};
