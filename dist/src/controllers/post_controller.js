"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const post_model_1 = __importDefault(require("../models/post_model"));
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let posts;
        if (req.query.sender == null) {
            posts = yield post_model_1.default.find();
        }
        else {
            posts = yield post_model_1.default.find({ 'sender': req.query.sender });
        }
        res.status(200).send(posts);
    }
    catch (err) {
        res.status(400).send({ 'error': "Failed to get posts" });
    }
});
const addNewPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const post = new post_model_1.default({
        message: req.body.message,
        sender: req.body.sender
    });
    try {
        const newPost = yield post.save();
        console.log("Post saved in db", newPost);
        res.status(200).send(newPost);
    }
    catch (err) {
        console.log("Failed to save post in db");
        res.status(400).send('Error: Failed to add new post');
    }
});
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_model_1.default.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    }
    catch (err) {
        console.error("Error retrieving post:", err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: "Invalid post ID format" });
        }
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = { getAllPosts, addNewPost, getPostById };
//# sourceMappingURL=post_controller.js.map