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
exports.sendError = exports.getTokenFromRequest = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const user_model_1 = __importDefault(require("../models/user_model"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID_IOS);
function getTokenFromRequest(req) {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
        return null;
    return authHeader.split(" ")[1];
}
exports.getTokenFromRequest = getTokenFromRequest;
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, "..", "uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
function generateTokens(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const accessToken = jsonwebtoken_1.default.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRATION });
        const refreshToken = jsonwebtoken_1.default.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION });
        return {
            accessToken,
            refreshToken,
        };
    });
}
const sendError = (res, message, statusCode = 400) => {
    if (!res.headersSent) {
        res.status(statusCode).json({ error: message });
    }
};
exports.sendError = sendError;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return (0, exports.sendError)(res, "Email and password are required");
    }
    try {
        const user = yield user_model_1.default.findOne({ email });
        if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
            return (0, exports.sendError)(res, "Bad email or password");
        }
        const tokens = yield generateTokens(user._id.toString());
        user.refresh_tokens.push(tokens.refreshToken);
        yield user.save();
        res.status(200).send(tokens);
    }
    catch (err) {
        console.error("Login error:", err);
        (0, exports.sendError)(res, "Failed to login", 500);
    }
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, nickname } = req.body;
    let profilePic = "";
    if (req.file) {
        profilePic = `/uploads/${req.file.filename}`;
    }
    if (!email || !password) {
        return (0, exports.sendError)(res, "Email and password are required");
    }
    try {
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            return (0, exports.sendError)(res, "User with this email already exists");
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = new user_model_1.default({
            email,
            password: hashedPassword,
            profilePic,
            nickname,
        });
        const newUser = yield user.save();
        const tokens = yield generateTokens(newUser._id.toString());
        res.status(201).json({ user: newUser, tokens });
    }
    catch (err) {
        console.error("Registration error:", err);
        (0, exports.sendError)(res, "Failed to register", 500);
    }
});
const checkEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    try {
        const user = yield user_model_1.default.findOne({ email });
        if (user) {
            return res.status(200).json({ available: false });
        }
        return res.status(200).json({ available: true });
    }
    catch (err) {
        console.error("Error checking email availability:", err);
        return res.status(500).json({ error: "Server error" });
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return (0, exports.sendError)(res, "Refresh token is required");
    }
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(payload._id);
        if (!user) {
            return (0, exports.sendError)(res, "User not found", 404);
        }
        user.refresh_tokens = user.refresh_tokens.filter((token) => token !== refreshToken);
        yield user.save();
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (err) {
        console.error("Logout error:", err);
        (0, exports.sendError)(res, "Failed to logout", 500);
    }
});
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return (0, exports.sendError)(res, "Refresh token is required");
    }
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(payload._id);
        if (!user || !user.refresh_tokens.includes(refreshToken)) {
            return (0, exports.sendError)(res, "Invalid refresh token", 403);
        }
        const tokens = yield generateTokens(user._id.toString());
        user.refresh_tokens = user.refresh_tokens.filter((token) => token !== refreshToken);
        user.refresh_tokens.push(tokens.refreshToken);
        yield user.save();
        res.status(200).json(tokens);
    }
    catch (err) {
        console.error("Refresh token error:", err);
        (0, exports.sendError)(res, "Failed to refresh token", 500);
    }
});
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = getTokenFromRequest(req);
    if (!token) {
        return (0, exports.sendError)(res, "Token required", 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(decoded._id).select("-password -refresh_tokens");
        if (!user) {
            return (0, exports.sendError)(res, "User not found", 404);
        }
        res.status(200).send(user);
    }
    catch (err) {
        console.error("Get profile error:", err);
        (0, exports.sendError)(res, "Failed to get profile", 500);
    }
});
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = getTokenFromRequest(req);
    if (!token) {
        return (0, exports.sendError)(res, "Token required", 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(decoded._id);
        if (!user) {
            return (0, exports.sendError)(res, "User not found", 404);
        }
        const { name, email, oldPassword, newPassword } = req.body;
        if (oldPassword && newPassword) {
            const isMatch = yield bcrypt_1.default.compare(oldPassword, user.password);
            if (!isMatch) {
                return (0, exports.sendError)(res, "Old password is incorrect", 400);
            }
            user.password = yield bcrypt_1.default.hash(newPassword, 10);
        }
        user.nickname = name || user.nickname;
        user.email = email || user.email;
        const updatedUser = yield user.save();
        res.status(200).send(updatedUser);
    }
    catch (err) {
        console.error("Update profile error:", err);
        (0, exports.sendError)(res, "Failed to update profile", 500);
    }
});
const updateProfilePic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = getTokenFromRequest(req);
    if (!token) {
        return (0, exports.sendError)(res, "Token required", 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(decoded._id);
        if (!user) {
            return (0, exports.sendError)(res, "User not found", 404);
        }
        if (req.file) {
            user.profilePic = `/uploads/${req.file.filename}`;
        }
        const updatedUser = yield user.save();
        res.status(200).send(updatedUser);
    }
    catch (err) {
        console.error("Update profile picture error:", err);
        (0, exports.sendError)(res, "Failed to update profile picture", 500);
    }
});
const updateNickname = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = getTokenFromRequest(req);
    if (!token) {
        return (0, exports.sendError)(res, "Token required", 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(decoded._id);
        if (!user) {
            return (0, exports.sendError)(res, "User not found", 404);
        }
        const { nickname } = req.body;
        if (!nickname) {
            return (0, exports.sendError)(res, "Nickname is required", 400);
        }
        user.nickname = nickname;
        const updatedUser = yield user.save();
        res.status(200).send(updatedUser);
    }
    catch (err) {
        console.error("Update nickname error:", err);
        (0, exports.sendError)(res, "Failed to update nickname", 500);
    }
});
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = getTokenFromRequest(req);
    if (!token) {
        return (0, exports.sendError)(res, "Token required", 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(decoded._id);
        if (!user) {
            return (0, exports.sendError)(res, "User not found", 404);
        }
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return (0, exports.sendError)(res, "Old and new passwords are required", 400);
        }
        const isMatch = yield bcrypt_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            return (0, exports.sendError)(res, "Old password is incorrect", 400);
        }
        user.password = yield bcrypt_1.default.hash(newPassword, 10);
        const updatedUser = yield user.save();
        res.status(200).send(updatedUser);
    }
    catch (err) {
        console.error("Update password error:", err);
        (0, exports.sendError)(res, "Failed to update password", 500);
    }
});
const googleCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    try {
        const ticket = yield client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID_IOS,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res
                .status(400)
                .json({ error: "Failed to get payload from token" });
        }
        let user = yield user_model_1.default.findOne({ googleId: payload.sub });
        if (!user) {
            user = new user_model_1.default({
                googleId: payload.sub,
                email: payload.email,
                nickname: payload.name,
                profilePic: payload.picture,
            });
            yield user.save();
        }
        const tokens = yield generateTokens(user._id.toString());
        res.json(tokens);
    }
    catch (error) {
        console.error("Error verifying token:", error);
        res.status(500).json({ error: "Failed to authenticate user" });
    }
});
const checkUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }
    try {
        const user = yield user_model_1.default.findOne({ nickname: username });
        if (user) {
            return res.status(200).json({ available: false });
        }
        return res.status(200).json({ available: true });
    }
    catch (err) {
        console.error("Error checking username availability:", err);
        return res.status(500).json({ error: "Server error" });
    }
});
const validatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = req.body;
    const token = getTokenFromRequest(req);
    if (!token) {
        return (0, exports.sendError)(res, "Token required", 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(decoded._id);
        if (!user) {
            return (0, exports.sendError)(res, "User not found", 404);
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (isMatch) {
            return res.status(200).json({ valid: true });
        }
        return res.status(200).json({ valid: false });
    }
    catch (error) {
        console.error("Validate password error:", error);
        (0, exports.sendError)(res, "Failed to validate password", 500);
    }
});
exports.default = {
    login,
    register,
    refresh,
    logout,
    generateTokens,
    sendError: exports.sendError,
    getProfile,
    upload,
    updateProfile,
    updateProfilePic,
    updateNickname,
    updatePassword,
    googleCallback,
    checkUsername,
    checkEmail,
    validatePassword,
};
//# sourceMappingURL=auth_controller.js.map