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

public_users.get('/',async function (req, res) {
    try{
        const data = await books;
  const books_string = JSON.stringify(data, null, 4);
  return res.status(300).send(books_string);
    }catch(e){
        console.log(e);
        return res.send("error")
    }
});

public_users.get('/isbn/:isbn',async function (req, res) {
  const isbn = req.params.isbn;
  if(isbn){
    const filtered_book = await JSON.stringify(books[isbn], null, 4);
    if(filtered_book){
        return res.status(300).send(filtered_book);
    }else{
        return res.json({message: "Book not found"})
    }
  }

 });
  
public_users.get('/author/:author',async function (req, res) {
  const keys = await Object.keys(books);
  const author = req.params.author;
  let filtered_books = [];
  if(author){
      await keys.forEach((key) => {
    if(books[key].author === author){
        filtered_books.push(books[key])
    }
     
  });
  
  return res.status(300).send(JSON.stringify(filtered_books, null, 4));
  }else{
      return res.json({"message" : "Author invalid"})
  }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    const keys = await Object.keys(books);
    const title = req.params.title;
    let filtered_books = [];
    if(title){
        
    }else{
        return res.json({"message": "title not correct!"})
    }
});

//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
    const isbn = req.params.isbn;
    if(isbn){
      const filtered_book = await books[isbn];
      if(filtered_book){
          return res.status(300).json({"reviews": filtered_book.reviews});
      }else{
          return res.json({"message": "Book not found"});
      }
    }else{
        return res.json({"message": "Invalid request"});
    }
});

module.exports.general = public_users;
