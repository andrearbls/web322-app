/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Andrea Robles        Student ID: 072128127        Date: February 4, 2022
*
* Online (Heroku) Link: ________________________________________________________
*
********************************************************************************/




const express = require("express");
const path = require("path");
const app = express();

const blogservice = require("./blog-service.js")
const posts = require("./data/posts.json");
const categories = require("./data/categories.json");

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect('/about');
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", (req, res) => {
    blogservice.getPublishedPosts().then(data=>{
        var publishedPosts = posts.filter(post => post.published == true);  
        res.send(publishedPosts);
    }).catch(err=>{
        res.status(500).send(err);
    })
});

app.get("/posts", (req, res) => {
    blogservice.getAllPosts().then(data=>{
        res.send(posts);
    }).catch(err=>{
        res.status(500).send(err);
    })
});

app.get("/categories", (req, res) => {
    blogservice.getCategories().then(data=>{
        res.send(categories);
    }).catch(err=>{
        res.status(500).send(err);
    })
});


app.use((req, res) => {
    res.status(404).send("Page Not Found");
});


blogservice.initialize().then(()=>{
    app.listen(HTTP_PORT, function(){
        console.log(`Express http server listening on port: ${HTTP_PORT}`);
    });
}).catch(err=>{
    console.log(err);
});





