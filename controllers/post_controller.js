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



const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        console.error("Error retrieving post:", err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: "Invalid post ID format" });
        }
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = { getAllPosts, addNewPost, getPostById}  
