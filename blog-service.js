const fs = require("fs");
const { resolve } = require("path");

let posts = [];
let categories = [];


module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/posts.json", "utf-8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                posts = JSON.parse(data);
                resolve();
            }
        });
        fs.readFile("./data/categories.json", "utf-8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                categories = JSON.parse(data);
                resolve();
            }
        });
    });
}


module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject("no results returned");
        } else {
            resolve(posts);
        }

    });
}



module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject("no results returned");
        } else {
            resolve(posts);
        }

    });
}


module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject("no results returned");
        } else {
            resolve(categories);
        }
    });
}


// Assignment 3 

module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        postData.id = (posts.length + 1);
        posts.push(postData);
        resolve(posts[posts.length - 1]);
    });
}


module.exports.getPostsByCategory = (category) => { 
    return new Promise((resolve, reject) => {
        let filteredPosts = posts.filter(a => a.category == category);

        if (filteredPosts.length == 0) {
            reject("no results returned"); return;
        } 
       resolve(filteredPosts);     
    })
};


module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        let filteredDate = posts.filter(a => new Date(a.postDate) > new Date(minDateStr));
       
        if (filteredDate.length == 0) {
            reject("no results returned"); return;
        } 
        resolve(filteredDate);
    });
}

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        let filteredPost = posts.filter(a => a.id == id);
        
        if (filteredPost.length == 0) {
            reject("no results returned"); return;
        } 
       resolve(filteredPost);     
    })
}
