import Post from '../models/post_model'; 
import { Request, Response } from 'express';


const getAllPosts = async(req: Request, res: Response) => {
    try {
        let posts;
        if (typeof req.query.sender === 'string') { 
            posts = await Post.find({ 'sender': req.query.sender });
        } else {
            posts = await Post.find(); 
        }
        res.status(200).send(posts);  
    } catch (err) {
        console.error("Failed to get posts:", err);
        res.status(400).send({ 'error': "Failed to get posts" });
    }
};





const addNewPost = async (req:Request, res:Response) => {
    console.log(req.body);

    const post = new Post({  
        message: req.body.message,
        sender: req.body.sender
    });

    try {
        
       const newPost = await post.save();  
        console.log("Post saved in db", newPost);
        res.status(200).send(newPost);
    } catch (err) {
        console.log("Failed to save post in db");
        res.status(400).send('Error: Failed to add new post');
    }
}



const getPostById = async (req:Request, res:Response) => {
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


// Update Post
const updatePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Post
const deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted' });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ message: 'Server error' });
    }
};



export = { getAllPosts, addNewPost, getPostById, deletePost, updatePost}  
