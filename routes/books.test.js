/* We have to specifically tell Node we're in test "mode"*/

process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const Book = require('../models/book')

let testBook;
const data = {
    "isbn": "0691161518",
    "amazon_url": "http://a.co/eobPtX2",
    "author": "Matthew Lane",
    "language": "english",
    "pages": 264,
    "publisher": "Princeton University Press",
    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    "year": 2017
  };



beforeEach(async function() {
    testBook = await Book.create(data);
});

describe("GET /books", function() {
    test("Gets a list of 1 book", async function() {
      const response = await request(app).get(`/books`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        books: [testBook]
      });
    });
  });

describe("GET /books/:isbn", function() {
    test("Gets a single book", async function() {
      const response = await request(app).get(`/books/${testBook.isbn}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({book: testBook});
    });
  
    test("Responds with 404 if can't find book", async function() {
      const response = await request(app).get(`/books/58490`);
      expect(response.statusCode).toEqual(404);
    });
});

describe("POST /books", function() {
    test("Creates a new book", async function() {
      const response = await request(app)
        .post(`/books`)
        .send({
            "isbn": "0783904090",
            "amazon_url": "http://a.co/djfkldc",
            "author": "Matthew Maddock",
            "language": "english",
            "pages": 600,
            "publisher": "Stanford University Press",
            "title": "How to get this money!",
            "year": 2019
          });
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({
        book: {
            "isbn": "0783904090",
            "amazon_url": "http://a.co/djfkldc",
            "author": "Matthew Maddock",
            "language": "english",
            "pages": 600,
            "publisher": "Stanford University Press",
            "title": "How to get this money!",
            "year": 2019
          }
      });
    });

    test("Responds with 400 if NaN is given for year", async function() {
        const response = await request(app)
        .post(`/books`)
        .send({
            "isbn": "0783904090",
            "amazon_url": "http://a.co/djfkldc",
            "author": "Matthew Maddock",
            "language": "english",
            "pages": 600,
            "publisher": "Stanford University Press",
            "title": "How to get this money!",
            "year": "two thousand and nineteen"
          });
      expect(response.statusCode).toEqual(400);
    });

    test("Responds with 400 if any of the required fields are left off", async function() {
        const response = await request(app)
        .post(`/books`)
        .send({
            "isbn": "0783904090",
            "amazon_url": "http://a.co/djfkldc",
            "author": "Matthew Maddock",
            "language": "english",
            "pages": 600,
            "title": "How to get this money!",
            "year": 2020
          });
      expect(response.statusCode).toEqual(400);
    });
  });

describe("PUT /books", function() {
    test("Edits existing book", async function() {
      const response = await request(app)
        .put(`/books/${testBook.isbn}`)
        .send({
            "isbn": "0691161518",
            "amazon_url": "http://a.co/djfkldc",
            "author": "Matthew Maddock",
            "language": "english",
            "pages": 600,
            "publisher": "Stanford University Press",
            "title": "How to get this money!",
            "year": 2019
          });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        book: {
            "isbn": "0691161518",
            "amazon_url": "http://a.co/djfkldc",
            "author": "Matthew Maddock",
            "language": "english",
            "pages": 600,
            "publisher": "Stanford University Press",
            "title": "How to get this money!",
            "year": 2019
          }
      });
    });

    test("Responds with 400 if only one field is to be changed", async function() {
        const response = await request(app)
        .post(`/books`)
        .send({
            "isbn": "0691161518",
            "title": "How to get this money!"
          });
      expect(response.statusCode).toEqual(400);
    });


});

describe("DELETE /books/:isbn", function() {
    test("Deletes a single book", async function() {
      const response = await request(app)
        .delete(`/books/${testBook.isbn}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ message: "Book deleted" });
    });
  });

afterEach(async function() {
    // delete any data created by test
    await db.query("DELETE FROM books");
  });
  
  afterAll(async function() {
    // close db connection
    await db.end();
  });