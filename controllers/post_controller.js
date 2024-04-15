const Post = require('../models/post_model'); 


const getAllPosts = async(req, res, next) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);  
    } catch (err) {
        if (!res.headersSent) {  
            res.status(400).json({ message: 'Error retrieving posts' });
        }
    }
}



const addNewPost = async (req, res, next) => {
    console.log(req.body);

    const post = new Post({  
        message: req.body.message,
        sender: req.body.sender
    });

    try {
        
        newPost = await post.save();  
        console.log("Post saved in db", newPost);
        res.status(200).send(newPost);
    } catch (err) {
        console.log("Failed to save post in db");
        res.status(400).send('Error: Failed to add new post');
    }
}

module.exports = { getAllPosts, addNewPost }  
