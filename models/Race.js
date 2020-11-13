const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
    name: String,
    index: String,
    url:String

})
module.exports = mongoose.model("Race", raceSchema);