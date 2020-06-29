const mongoose = require("mongoose")
const Schema = mongoose.Schema
const FriendSchema = new Schema({
    userId:{
        type: String,
        required: true
    },
    user2Id:{
        type: String,
        required: true
    },
    createdDate:{
        type: Date,
        default: Date.now
    }
})

module.exports = Friend = mongoose.model("friends", FriendSchema)