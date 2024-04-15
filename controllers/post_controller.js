const Post = require('../models/post_model'); 

const getAllPosts = (req, res, next) => {
    res.send('get all posts');
}

const addNewPost = async (req, res, next) => {
    console.log(req.body);

    try {
        const post = new Post({  
            message: req.body.message,
            sender: req.body.sender
        });

        const newPost = await post.save();  
        console.log("Post saved in db", newPost);
        res.status(200).send(newPost);
    } catch (err) {
        console.log("Failed to save post in db", err);
        res.status(400).send('Error: Failed to add new post');
    }
}

module.exports = { getAllPosts, addNewPost }  
