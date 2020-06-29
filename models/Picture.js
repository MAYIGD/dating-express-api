const mongoose = require("mongoose")
const Schema = mongoose.Schema
const PictureSchema = new Schema({
    path:{
        type: String,
        required: true
    },
    userId:{
        type: String,
        required: true
    },
    createdDate:{
        type: Date,
        default: Date.now
    }
})

module.exports = Picture = mongoose.model("pictures", PictureSchema)