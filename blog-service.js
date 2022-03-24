const Sequelize = require('sequelize');

var sequelize = new Sequelize('d4ckil6ahe3imu', 'imjwchxmbgytyi', 'f50883f4e4ece1961ada8e8b237181ab7ea0796856ede98c9651bfbc01164cdd', {
    host: 'ec2-3-219-63-251.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});


const Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});


const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});


Post.belongsTo(Category, {
    foreignKey: 'category'
});


// Initialize Route

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync()
            .then(() => {
                resolve("database synced");
            })
            .catch(() => {
                reject("unable to sync database");
            })
    });
};


// getAllPosts Route

module.exports.getAllPosts = function () {
    return new Promise(function (resolve, reject) {
        Post.findAll()
            .then((data) => {
                let err = 5 / 0;
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
    });
};


// getPublishedPosts Route

module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned")
            })
    });
}


// getCategories Route

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
    });
}


// addPost Route

module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (const prop in postData) {
            if (postData[prop] === "") { 
                postData[prop] = null; 
            }
        }

        postData.postDate = new Date();

        Post.create(postData)
            .then(resolve())
            .catch(reject('unable to create post'))
    });
};


// getPostsByCategory Route

module.exports.getPostsByCategory = (category) => {
    return new Promise(function (resolve, reject) {
        Post.findAll({
            where: {
                category: category
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned")
            })
    });
};


// getPostsByMinDate Route

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;

        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject("no results returned");
        });

    });
}


// getPostById Route

module.exports.getPostById = (id) => {
    return new Promise(function (resolve, reject) {
        Post.findAll({
            where: {
                id: id
            }
        })
            .then((data) => {
                resolve(data[0]); // there is only one result
            })
            .catch(() => {
                reject("no results returned")
            })
    });
}


// getPublishedPostsByCategory Route

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned")
            })
    });
}


// Add Category

module.exports.addCategory = (categoryData) => {
    return new Promise(function (resolve, reject) {
        // ensure all empty attributes are set to null
        for (var a in categoryData) {
            if (categoryData[a] == "") {
                categoryData[a] = null;
            }
        }
        Category.create(categoryData)
        .then(resolve())
        .catch(reject('unable to create category'))
    });
};


// Delete Categories by Id

module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve,reject) => {
        Category.destroy({
            where: {
                id: id
            }
        })
        .then(resolve())
        .catch(reject('unable to delete category'))
    })
};


// Delete Posts by Id

module.exports.deletePostById = (id) => {
    return new Promise((resolve,reject) => {
        Post.destroy({
            where: {
                id: id
            }
        })
        .then(() => {
            resolve() 
        })
        .catch(() => {
            reject('unable to delete post')
        })
    })
};

