const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const sanitize = require('mongo-sanitize');
const path = require('path');
const app = express();
require('./db');

const sessionOptions = { 
	secret: 'secret for signing session id', 
	saveUninitialized: false, 
	resave: false 
};

app.set('view engine', 'hbs');
app.use(session(sessionOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(function(req, res, next) {
    if(!res.locals.pageCount) { res.locals.pageCount = 0; }
    if(req.session.pageCount) { res.locals.pageCount += req.session.pageCount; }
    next();
});

// mongoose models
const Book = mongoose.model('Book');
const Review = mongoose.model('Review');

app.get('/', (req, res) => {
    res.redirect('/books');
});

app.get('/books', (req, res) => {
    req.session.pageCount++;
    const queryObj = {};
    if(req.query.filter && req.query.filterVal) {
        queryObj[req.query.filter] = req.query.filterVal;
    }
    Book.find(queryObj, (err, result) => {
        if(err) { res.render('books', {title: "Could not find books fitting that query."}); }
        res.render('books', {result});
    });
    
});

app.get('/books-new', (req, res) => {
    req.session.pageCount++;
    res.render('newbook');
});

app.post('/books-new', (req, res) => {
    const book = new Book({
        title: sanitize(req.body.title),
        author: sanitize(req.body.author),
        isbn: sanitize(req.body.isbn)
    });
    book.save((err, book) => {
        if(err) { 
            const warning = "Uh-oh, we couldn't make your book. Try again?";
            res.render('newbook', {warning});
        } else {
            console.log(`Added ${book} to db`);
            res.redirect('/');
        } 
    });
});

app.get('/books/:slug', (req, res) => {
    req.session.pageCount++;
    Book.findOne({slug: sanitize(req.params.slug)}, (err, result) => {
        if(result === null) { 
            res.status(404);
            res.render('notfound');
        }  
        else if(result.reviews.length > 0) {
            res.render('bookdetails', {result: result, hasReviews: true});
        } else {
            res.render('bookdetails', {result: result});
        }
    });
});

app.post('/books/:slug/comments', (req, res) => {
    const reviewEntry = new Review({
        name: sanitize(req.body.name),
        rating: sanitize(req.body.rating),
        text: sanitize(req.body.text)
    });

    Book.findOneAndUpdate({slug: sanitize(req.params.slug)}, {$push: {reviews: reviewEntry}}, (err, book, count) => {
        console.log("failed", err, book, count);
    });

    res.redirect(`/books/${sanitize(req.params.slug)}`);
});

app.use(function(req, res, next) {
    res.status(404);
    res.render('notfound');
});

app.listen(3000);
