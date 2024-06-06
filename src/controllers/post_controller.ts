import { Request, Response } from "express";
import Post from "../models/post_model";
import User from "../models/user_model";
import jwt from "jsonwebtoken";
import { getTokenFromRequest, sendError } from "../controllers/auth_controller";
import { TokenPayload } from "../types";

const getAllPosts = async (req: Request, res: Response) => {
  try {
    let posts;
    if (typeof req.query.sender === "string") {
      posts = await Post.find({ sender: req.query.sender }).populate(
        "sender",
        "name email profilePic"
      );
    } else {
      posts = await Post.find().populate("sender", "name email profilePic");
    }
    res.status(200).send(posts);
  } catch (err) {
    console.error("Failed to get posts:", err);
    res.status(400).send({ error: "Failed to get posts" });
  }
};

const getUserPosts = async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return sendError(res, "Token required", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as TokenPayload;
    const user = await User.findById(decoded._id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const posts = await Post.find({ sender: user._id }).populate(
      "sender",
      "name email profilePic"
    );
    res.status(200).send(posts);
  } catch (err) {
    console.error("Failed to get user posts:", err);
    res.status(400).send({ error: "Failed to get user posts" });
  }
};

const addNewPost = async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return sendError(res, "Token required", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as TokenPayload;
    const user = await User.findById(decoded._id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const { message } = req.body;
    let image = "";

    if (req.file) {
      image = `/uploads/${req.file.filename}`; // שמירת הנתיב היחסי
    }

    const post = new Post({
      message,
      sender: user._id,
      senderName: user.name || "Unknown",
      image,
    });

    const newPost = await post.save();
    res.status(201).send({ message: "success", post: newPost });
  } catch (err) {
    console.error("Failed to save post in db", err);
    sendError(res, "Error: Failed to add new post", 400);
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "sender",
      "name email profilePic"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error("Error retrieving post:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid post ID format" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const updatePost = async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return sendError(res, "Token required", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as TokenPayload;
    const user = await User.findById(decoded._id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const { message } = req.body;
    let image = req.body.image;

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { message, image },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  getAllPosts,
  addNewPost,
  getPostById,
  deletePost,
  updatePost,
  getUserPosts,
};
