// db.js
require('mongodb')
const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

// schema
const ReviewSchema = new mongoose.Schema({
    rating: {type: Number, required: true},
    name: {type: String},
    text: {type: String, required: true}
});

const BookSchema = new mongoose.Schema({
    title: {type: String, required: true},
    author: {type: String, required: true},
    isbn: {type: String, required: true},
    reviews: [ReviewSchema]
});

BookSchema.plugin(URLSlugs('title author'));
mongoose.model("Book", BookSchema);
mongoose.model("Review", ReviewSchema);

mongoose.connect('mongodb://0.0.0.0/27017', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});