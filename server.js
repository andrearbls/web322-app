/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Andrea Robles        Student ID: 072128127        Date: March 10, 2022
*
* Online (Heroku) Link: https://web322-andrea.herokuapp.com/about
*
********************************************************************************/



const express = require("express");
const exphbs = require("express-handlebars");
const multer = require("multer");
const upload = multer();
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const path = require("path");
const app = express();

const blogservice = require("./blog-service.js")
const blogData = require("./blog-service");
const posts = require("./data/posts.json");
const categories = require("./data/categories.json");
const { rmSync } = require("fs");
const stripJs = require('strip-js');


const HTTP_PORT = process.env.PORT || 8080;


app.use(express.static("public"));

app.engine(".hbs", exphbs.engine({ 
    extname: ".hbs",
    helpers: {
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
           },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
            return options.inverse(this);
            } else {
            return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
           }  
    }
}));


app.set("view engine", ".hbs");


app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
   });


app.get("/", (req, res) => {
    res.redirect('/blog');
});


app.get("/about", (req, res) => {
    res.render(path.join(__dirname, "/views/about.hbs"));
});


app.get("/posts/add", (req, res) => {
    res.render(path.join(__dirname, "/views/addPost.hbs"));
});


cloudinary.config({
    cloud_name: 'andrearobles',
    api_key: '863738236845795',
    api_secret: 'IoQxhecV3IcLGLh0c_Z0i7_0kYA',
    secure: true
});


app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});



app.get("/posts", (req, res) => {
    let category = req.query.category;
    let minDate = req.query.minDate;

    if (category) {
        blogservice.getPostsByCategory(category).then(data => {
            res.render("posts", {posts: data})      
        }).catch(err=>{
            res.render("posts", {message: "no results"});
        });
    }
    else if (minDate != "" && minDate != null) {
        blogservice.getPostsByMinDate(minDate).then(data => {
            res.render("posts", {posts: data})     
        }).catch(err=>{
            res.render("posts", {message: "no results"});
        });
    }
    else {
        blogservice.getAllPosts().then(data => {
            res.render("posts", {posts: data})     
        }).catch(err=>{
            res.render("posts", {message: "no results"});
        })
    }
});


app.get("/categories", (req, res) => {
    blogservice.getCategories().then(data => {
        res.render("categories", {categories: data})  
    }).catch(err => {
        res.render("categories", {message: "no results"});
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
        res.render("post", {post: data})
    }).catch(err => {
        res.render("post", {message: "no results"});
    });
});



// Assignment 4 - (Part 5)

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
        console.log(viewData.post)
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
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










