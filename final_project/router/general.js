const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!doesExist(username)) {
            users.push({"username": username, "password": password});
            console.log(users)
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    return res.status(404).json({message: "Unable to register user."});
});

public_users.get('/',function (req, res) {
  const books_string = JSON.stringify(books, null, 4);
  return res.status(300).send(books_string);
});

public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if(isbn){
    const filtered_book = JSON.stringify(books[isbn], null, 4);
    if(filtered_book){
        return res.status(300).send(filtered_book);
    }else{
        return res.send("Book not found")
    }
  }

 });
  
public_users.get('/author/:author',function (req, res) {
  const keys = Object.keys(books);
  const author = req.params.author;
  let filtered_books = [];
  keys.forEach((key) => {
    if(books[key].author === author){
        filtered_books.push(books[key])
    }
     
  });
  
  return res.status(300).send(JSON.stringify(filtered_books, null, 4));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const keys = Object.keys(books);
    const title = req.params.title;
    let filtered_books = [];
    keys.forEach((key) => {
      if(books[key].title === title){
          filtered_books.push(books[key])
      }
       
    });
    return res.status(300).send(JSON.stringify(filtered_books, null, 4));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if(isbn){
      const filtered_book = books[isbn];
      if(filtered_book){
          return res.status(300).json({"reviews": filtered_book.reviews});
      }else{
          return res.send("Book not found");
      }
    }
});

module.exports.general = public_users;
