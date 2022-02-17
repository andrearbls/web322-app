/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Andrea Robles        Student ID: 072128127        Date: February 17, 2022
*
* Online (Heroku) Link: https://web322-andrea.herokuapp.com/about
*
********************************************************************************/



const express = require("express");
const multer = require("multer");
const upload = multer();
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const path = require("path");
const app = express();

const blogservice = require("./blog-service.js")
const posts = require("./data/posts.json");
const categories = require("./data/categories.json");
const { rmSync } = require("fs");


const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));


app.get("/", (req, res) => {
    res.redirect('/about');
});


app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});


app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
});


cloudinary.config({
    cloud_name: 'andrearobles',
    api_key: '863738236845795',
    api_secret: 'IoQxhecV3IcLGLh0c_Z0i7_0kYA',
    secure: true
});


app.get("/blog", (req, res) => {
    blogservice.getPublishedPosts().then(data => {
        var publishedPosts = posts.filter(post => post.published == true);
        res.send(publishedPosts);
    }).catch(err => {
        res.status(500).send(err);
    })
});


app.get("/posts", (req, res) => {
    let category = req.query.category;
    let minDate = req.query.minDate;

    if (category) {
        blogservice.getPostsByCategory(category).then(data => {
            res.send(data);
        }).catch(err=>{
            res.send({message: err});
        });
    }
    else if (minDate != "" && minDate != null) {
        blogservice.getPostsByMinDate(minDate).then(data => {
            res.send(data);
        }).catch(err=>{
            res.send({message: err});
        });
    }
    else {
        blogservice.getAllPosts().then(data => {
            res.send(data);
        }).catch(err=>{
            res.send({message: err});
        })
    }
});


app.get("/categories", (req, res) => {
    blogservice.getCategories().then(data => {
        res.send(categories);
    }).catch(err => {
        res.status(500).send(err);
    })
});



// Assignment 3 - (Part 2:  Step 2)


app.post('/posts/add', upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }

    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;

        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts

        blogservice.addPost(req.body).then(() => {
            res.redirect("/posts");
        }).catch(err => {
            res.status(500).send(err);
        })
    }
});



// Assignment 3 - (Part 3:  Step 2)

app.get('/post/:value', (req, res) => {
    blogservice.getPostById(req.params.value).then((data) => {
        res.json({data});
    }).catch(err => {
        res.json({ message: err });
    });
});


app.use((req, res) => {
    res.status(404).send("Page Not Found");
});


blogservice.initialize().then(() => {
    app.listen(HTTP_PORT, function () {
        console.log(`Express http server listening on port: ${HTTP_PORT}`);
    });
}).catch(err => {
    console.log(err);
});





