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
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = __importDefault(require("../models/post_model"));
const user_model_1 = __importDefault(require("../models/user_model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_controller_1 = require("../controllers/auth_controller");
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let posts;
        if (typeof req.query.sender === "string") {
            posts = yield post_model_1.default.find({ sender: req.query.sender }).populate("sender", "name email profilePic");
        }
        else {
            posts = yield post_model_1.default.find().populate("sender", "name email profilePic");
        }
        res.status(200).send(posts);
    }
    catch (err) {
        console.error("Failed to get posts:", err);
        res.status(400).send({ error: "Failed to get posts" });
    }
});
const getUserPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = (0, auth_controller_1.getTokenFromRequest)(req);
    if (!token) {
        return (0, auth_controller_1.sendError)(res, "Token required", 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(decoded._id);
        if (!user) {
            return (0, auth_controller_1.sendError)(res, "User not found", 404);
        }
        const posts = yield post_model_1.default.find({ sender: user._id }).populate("sender", "name email profilePic");
        res.status(200).send(posts);
    }
    catch (err) {
        console.error("Failed to get user posts:", err);
        res.status(400).send({ error: "Failed to get user posts" });
    }
});
const addNewPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = (0, auth_controller_1.getTokenFromRequest)(req);
    if (!token) {
        return (0, auth_controller_1.sendError)(res, "Token required", 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(decoded._id);
        if (!user) {
            return (0, auth_controller_1.sendError)(res, "User not found", 404);
        }
        const { message } = req.body;
        let image = "";
        if (req.file) {
            image = `/uploads/${req.file.filename}`; // שמירת הנתיב היחסי
        }
        const post = new post_model_1.default({
            message,
            sender: user._id,
            senderName: user.name || "Unknown",
            image,
        });
        const newPost = yield post.save();
        res.status(201).send({ message: "success", post: newPost });
    }
    catch (err) {
        console.error("Failed to save post in db", err);
        (0, auth_controller_1.sendError)(res, "Error: Failed to add new post", 400);
    }
});
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_model_1.default.findById(req.params.id).populate("sender", "name email profilePic");
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json(post);
    }
    catch (err) {
        console.error("Error retrieving post:", err);
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid post ID format" });
        }
        res.status(500).json({ message: "Server error" });
    }
});
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = (0, auth_controller_1.getTokenFromRequest)(req);
    if (!token) {
        return (0, auth_controller_1.sendError)(res, "Token required", 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(decoded._id);
        if (!user) {
            return (0, auth_controller_1.sendError)(res, "User not found", 404);
        }
        const { message } = req.body;
        let image = req.body.image;
        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        }
        const post = yield post_model_1.default.findByIdAndUpdate(req.params.id, { message, image }, { new: true });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json(post);
    }
    catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ message: "Server error" });
    }
});
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_model_1.default.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json({ message: "Post deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = {
    getAllPosts,
    addNewPost,
    getPostById,
    deletePost,
    updatePost,
    getUserPosts,
};
//# sourceMappingURL=post_controller.js.map