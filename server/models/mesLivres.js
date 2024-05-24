const mongoose = require("mongoose");

const mesLivresModels = new mongoose.Schema({
    nom : String,
    desc : String
});

const mesLivres = mongoose.model("mesLivres",mesLivresModels);

module.exports= mesLivres;