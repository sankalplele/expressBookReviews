const express = require("express");
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (doesExist(username)) {
    return res.status(400).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res
    .status(201)
    .json({ message: "User successfully registered. Now you can login" });
});

public_users.get("/", function (req, res) {
  return res.status(200).json(books);
});

public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const filtered_book = books[isbn];

  if (!filtered_book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(filtered_book);
});

public_users.get("/author/:author", function (req, res) {
  const author = req.params.author.toLowerCase();
  const filtered_books = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author,
  );

  if (filtered_books.length === 0) {
    return res.status(404).json({ message: "No books found for that author" });
  }

  return res.status(200).json(filtered_books);
});

public_users.get("/title/:title", function (req, res) {
  const title = req.params.title.toLowerCase();
  const filtered_books = Object.values(books).filter(
    (book) => book.title.toLowerCase() === title,
  );

  if (filtered_books.length === 0) {
    return res.status(404).json({ message: "No books found with that title" });
  }

  return res.status(200).json(filtered_books);
});

public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const filtered_book = books[isbn];

  if (!filtered_book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json({ reviews: filtered_book.reviews });
});

module.exports.general = public_users;
