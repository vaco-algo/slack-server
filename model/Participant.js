const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  peoples: {},
});

module.exports = mongoose.model("Participant", participantSchema);
