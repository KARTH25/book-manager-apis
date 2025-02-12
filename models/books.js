const mongoose = { Schema } = require('mongoose');

const bookSchema = new Schema({
    id : { type : String, required : true },
    name : { type : String, required : true },
    author : { type : String, required : true },
    description : { type : String, required : true }
}) 

module.exports = mongoose.model('Book', bookSchema);