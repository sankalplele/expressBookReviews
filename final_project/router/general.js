const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

const fetchAllBooks = async () => {
  return axios.get(`${BASE_URL}/internal/books`);
};

const fetchBookByISBN = async (isbn) => {
  return axios.get(`${BASE_URL}/internal/books/${encodeURIComponent(isbn)}`);
};

const fetchBooksByAuthor = async (author) => {
  return axios.get(
    `${BASE_URL}/internal/books/author/${encodeURIComponent(author)}`,
  );
};

const fetchBooksByTitle = async (title) => {
  return axios.get(
    `${BASE_URL}/internal/books/title/${encodeURIComponent(title)}`,
  );
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

// Internal endpoints used by Axios to demonstrate async requests
public_users.get("/internal/books", (req, res) => {
  return res.status(200).json(books);
});

public_users.get("/internal/books/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const filtered_book = books[isbn];

  if (!filtered_book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(filtered_book);
});

public_users.get("/internal/books/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();
  const filtered_books = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author,
  );

  if (filtered_books.length === 0) {
    return res.status(404).json({ message: "No books found for that author" });
  }

  return res.status(200).json(filtered_books);
});

public_users.get("/internal/books/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  const filtered_books = Object.values(books).filter(
    (book) => book.title.toLowerCase() === title,
  );

  if (filtered_books.length === 0) {
    return res.status(404).json({ message: "No books found with that title" });
  }

  return res.status(200).json(filtered_books);
});

public_users.get("/", async (req, res) => {
  try {
    const response = await fetchAllBooks();
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve books",
      error: error.message,
    });
  }
});

public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await fetchBookByISBN(isbn);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(500).json({
      message: "Unable to retrieve book by ISBN",
      error: error.message,
    });
  }
});

public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const response = await fetchBooksByAuthor(author);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res
        .status(404)
        .json({ message: "No books found for that author" });
    }
    return res.status(500).json({
      message: "Unable to retrieve books by author",
      error: error.message,
    });
  }
});

public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
    const response = await fetchBooksByTitle(title);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res
        .status(404)
        .json({ message: "No books found with that title" });
    }
    return res.status(500).json({
      message: "Unable to retrieve books by title",
      error: error.message,
    });
  }
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
