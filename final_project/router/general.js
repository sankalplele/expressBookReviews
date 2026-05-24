/**
 * General.js - Public Routes for Book Review API
 *
 * This file defines public routes for book retrieval operations.
 * It implements async/await with Axios for fetching book data and includes
 * comprehensive error handling for various HTTP response scenarios.
 */

// Import required dependencies
const express = require("express");
const axios = require("axios");

// Import local modules
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;

// Create an Express router instance for public routes
const public_users = express.Router();

// Base URL for internal API calls (defaults to localhost:5000)
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

/**
 * Helper function to check if a username already exists in the system
 * @param {string} username - The username to check
 * @returns {boolean} - True if username exists, false otherwise
 */
const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

/**
 * Async function to fetch all available books using Axios
 * Makes a GET request to the internal books endpoint
 * @returns {Promise} - Axios promise resolving to the books data
 */
const fetchAllBooks = async () => {
  return axios.get(`${BASE_URL}/internal/books`);
};

/**
 * Async function to fetch a specific book by ISBN using Axios
 * Encodes the ISBN parameter to handle special characters safely
 * @param {string} isbn - The ISBN of the book to retrieve
 * @returns {Promise} - Axios promise resolving to the book data
 */
const fetchBookByISBN = async (isbn) => {
  return axios.get(`${BASE_URL}/internal/books/${encodeURIComponent(isbn)}`);
};

/**
 * Async function to fetch books by author using Axios
 * Encodes the author parameter to handle special characters and spaces safely
 * @param {string} author - The author name to search for
 * @returns {Promise} - Axios promise resolving to an array of books by that author
 */
const fetchBooksByAuthor = async (author) => {
  return axios.get(
    `${BASE_URL}/internal/books/author/${encodeURIComponent(author)}`,
  );
};

/**
 * Async function to fetch books by title using Axios
 * Encodes the title parameter to handle special characters and spaces safely
 * @param {string} title - The book title to search for
 * @returns {Promise} - Axios promise resolving to an array of books with that title
 */
const fetchBooksByTitle = async (title) => {
  return axios.get(
    `${BASE_URL}/internal/books/title/${encodeURIComponent(title)}`,
  );
};

/**
 * POST /register
 * Register a new user with username and password
 * Validates input, checks for duplicate usernames, and stores new user credentials
 * @route POST /register
 * @param {string} username - The desired username (required)
 * @param {string} password - The desired password (required)
 * @returns {Object} - 201 Created if successful, 400 Bad Request if validation fails
 */
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Validate that both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if user already exists
  if (doesExist(username)) {
    return res.status(400).json({ message: "User already exists!" });
  }

  // Add new user to the users array
  users.push({ username, password });
  return res
    .status(201)
    .json({ message: "User successfully registered. Now you can login" });
});

/**
 * INTERNAL ENDPOINTS - Used by Axios for async/await demonstration
 * These endpoints serve as the data source for the public async routes
 */

/**
 * GET /internal/books
 * Retrieve all books from the database (synchronous)
 * @route GET /internal/books
 * @returns {Object} - 200 OK with all books data
 */
public_users.get("/internal/books", (req, res) => {
  return res.status(200).json(books);
});

/**
 * GET /internal/books/:isbn
 * Retrieve a specific book by its ISBN (synchronous)
 * @route GET /internal/books/:isbn
 * @param {string} isbn - The ISBN identifier
 * @returns {Object} - 200 OK if found, 404 Not Found if no book matches the ISBN
 */
public_users.get("/internal/books/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const filtered_book = books[isbn];

  if (!filtered_book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(filtered_book);
});

/**
 * GET /internal/books/author/:author
 * Retrieve all books by a specific author (synchronous)
 * Case-insensitive author matching for better user experience
 * @route GET /internal/books/author/:author
 * @param {string} author - The author name to search for
 * @returns {Object} - 200 OK with array of books, 404 Not Found if no matches
 */
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

/**
 * GET /internal/books/title/:title
 * Retrieve all books with a specific title (synchronous)
 * Case-insensitive title matching for better user experience
 * @route GET /internal/books/title/:title
 * @param {string} title - The book title to search for
 * @returns {Object} - 200 OK with array of books, 404 Not Found if no matches
 */
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

/**
 * PUBLIC ASYNC ENDPOINTS - Using Axios and async/await for book retrieval
 */

/**
 * GET /
 * Retrieve all available books using async/await with Axios
 * Demonstrates async pattern with proper error handling
 * @route GET /
 * @returns {Object} - 200 OK with all books, 500 Internal Server Error if request fails
 */
public_users.get("/", async (req, res) => {
  try {
    // Make async Axios request to internal endpoint
    const response = await fetchAllBooks();
    return res.status(200).json(response.data);
  } catch (error) {
    // Handle any errors that occur during the async request
    return res.status(500).json({
      message: "Unable to retrieve books",
      error: error.message,
    });
  }
});

/**
 * GET /isbn/:isbn
 * Retrieve a specific book by ISBN using async/await with Axios
 * Handles both 404 (not found) and 500 (server error) scenarios
 * @route GET /isbn/:isbn
 * @param {string} isbn - The ISBN of the book to retrieve
 * @returns {Object} - 200 OK with book data, 404 Not Found, or 500 Server Error
 */
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    // Make async Axios request to fetch book by ISBN
    const response = await fetchBookByISBN(isbn);
    return res.status(200).json(response.data);
  } catch (error) {
    // Differentiate between 404 (not found) and other errors
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(500).json({
      message: "Unable to retrieve book by ISBN",
      error: error.message,
    });
  }
});

/**
 * GET /author/:author
 * Retrieve books by a specific author using async/await with Axios
 * Demonstrates proper async/await pattern with comprehensive error handling
 * Handles both "not found" and request failure scenarios
 * @route GET /author/:author
 * @param {string} author - The author name to search for
 * @returns {Object} - 200 OK with array of books, 404 Not Found, or 500 Server Error
 */
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    // Make async Axios request to fetch books by author
    const response = await fetchBooksByAuthor(author);
    return res.status(200).json(response.data);
  } catch (error) {
    // Handle 404 responses specifically
    if (error.response && error.response.status === 404) {
      return res
        .status(404)
        .json({ message: "No books found for that author" });
    }
    // Handle other server errors
    return res.status(500).json({
      message: "Unable to retrieve books by author",
      error: error.message,
    });
  }
});

/**
 * GET /title/:title
 * Retrieve books by a specific title using async/await with Axios
 * Implements async/await pattern with error handling for title-based search
 * @route GET /title/:title
 * @param {string} title - The book title to search for
 * @returns {Object} - 200 OK with array of books, 404 Not Found, or 500 Server Error
 */
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
    // Make async Axios request to fetch books by title
    const response = await fetchBooksByTitle(title);
    return res.status(200).json(response.data);
  } catch (error) {
    // Handle 404 responses specifically
    if (error.response && error.response.status === 404) {
      return res
        .status(404)
        .json({ message: "No books found with that title" });
    }
    // Handle other server errors
    return res.status(500).json({
      message: "Unable to retrieve books by title",
      error: error.message,
    });
  }
});

/**
 * GET /review/:isbn
 * Retrieve all reviews for a specific book by ISBN
 * Returns only the reviews object associated with the book
 * @route GET /review/:isbn
 * @param {string} isbn - The ISBN of the book
 * @returns {Object} - 200 OK with reviews object, 404 Not Found if book doesn't exist
 */
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const filtered_book = books[isbn];

  // Check if the book exists
  if (!filtered_book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Return only the reviews for this book
  return res.status(200).json({ reviews: filtered_book.reviews });
});

// Export the router for use in the main application
module.exports.general = public_users;
