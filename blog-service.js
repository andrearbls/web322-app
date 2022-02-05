const fs = require("fs");

let posts = [];
let categories = [];
let publishedPosts = [];
module.exports.initialize = function(){
    return new Promise((resolve,reject)=>{
        fs.readFile("./data/posts.json", "utf-8", (err,data)=>{
            if(err){
                reject(err);
            }else{
                posts = JSON.parse(data);
                resolve();
            }
        });
        fs.readFile("./data/categories.json", "utf-8", (err,data)=>{
            if(err){
                reject(err);
            }else{
                categories = JSON.parse(data);
                resolve();
            }
        });
    }); 
}


module.exports.getAllPosts = function(){
    return new Promise((resolve,reject)=>{
        if(posts.length == 0){
            reject("no results returned");
        }else{
            resolve(posts);
        }
 
    });
}



module.exports.getPublishedPosts = function(){
    return new Promise((resolve,reject)=>{
        
        if(posts.length == 0){
            reject("no results returned");
        }else{
            resolve(posts);
        }
 
    });
}


module.exports.getCategories = function(){
    return new Promise((resolve,reject)=>{
        if(categories.length == 0){
            reject("no results returned");
        }else{
            resolve(categories);
        }
    });
}