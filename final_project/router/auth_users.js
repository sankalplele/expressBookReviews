const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return typeof username === "string" && username.trim().length > 0;
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password,
  );
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: username }, "access", {
      expiresIn: 60 * 60,
    });
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).json({ message: "User successfully logged in" });
  }

  return res
    .status(401)
    .json({ message: "Invalid Login. Check username and password" });
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review || req.query.review;
  const username =
    req.session.authorization && req.session.authorization.username;

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required" });
  }

  const filtered_book = books[isbn];
  if (!filtered_book) {
    return res.status(404).json({ message: "Book not found" });
  }

  filtered_book.reviews[username] = review;
  return res
    .status(200)
    .json({
      message: "Review added successfully",
      reviews: filtered_book.reviews,
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username =
    req.session.authorization && req.session.authorization.username;

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!isbn) {
    return res.status(400).json({ message: "ISBN is required" });
  }

  const filtered_book = books[isbn];
  if (!filtered_book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!filtered_book.reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  delete filtered_book.reviews[username];
  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
