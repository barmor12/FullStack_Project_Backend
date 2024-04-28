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
const user_model_1 = __importDefault(require("../models/user_model"));
function getTokenFromRequest(req) {
    const authHeader = req.headers['authorization'];
    if (authHeader == null)
        return null;
    return authHeader.split(' ')[1];
}
exports.getTokenFromRequest = getTokenFromRequest;
// Async function to generate access and refresh tokens
function generateTokens(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield jsonwebtoken_1.default.sign({ '_id': userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRATION });
        const refreshToken = yield jsonwebtoken_1.default.sign({ '_id': userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION });
        return {
            'accessToken': accessToken,
            'refreshToken': refreshToken
        };
    });
}
const sendError = (res, message, statusCode = 400) => {
    if (!res.headersSent) {
        res.status(statusCode).json({ error: message });
    }
};
exports.sendError = sendError;
function isTokenPayload(payload) {
    return payload && typeof payload === 'object' && '_id' in payload;
}
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
        // Convert ObjectId to string and use generateTokens function to simplify token creation
        const tokens = yield generateTokens(user._id.toString());
        if (user.refresh_tokens == null)
            user.refresh_tokens = [tokens.refreshToken];
        else
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
    const { email, password } = req.body;
    if (!email || !password) {
        return (0, exports.sendError)(res, "Email and password are required");
    }
    try {
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            return (0, exports.sendError)(res, "User already exists");
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new user_model_1.default({ email, password: hashedPassword, refresh_tokens: [] });
        yield newUser.save();
        res.status(201).send({ message: "User registered successfully" });
    }
    catch (err) {
        console.error("Registration error:", err);
        (0, exports.sendError)(res, "Error during registration", 500);
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = getTokenFromRequest(req);
    if (refreshToken == null) {
        return (0, exports.sendError)(res, "Token required", 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!isTokenPayload(decoded)) {
            return (0, exports.sendError)(res, "Invalid token format", 401);
        }
        const user = yield user_model_1.default.findById(decoded._id);
        if (user == null) {
            return (0, exports.sendError)(res, "User not found", 404);
        }
        if (!user.refresh_tokens.includes(refreshToken)) {
            user.refresh_tokens = [];
            yield user.save();
            return (0, exports.sendError)(res, "Invalid refresh token", 401);
        }
        user.refresh_tokens.splice(user.refresh_tokens.indexOf(refreshToken), 1);
        yield user.save();
        res.status(200).send({ message: "Logged out successfully" });
    }
    catch (err) {
        console.error("Logout error:", err);
        (0, exports.sendError)(res, "Failed to logout", 500);
    }
});
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = getTokenFromRequest(req);
    if (refreshToken == null) {
        return (0, exports.sendError)(res, "Token required", 401);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!isTokenPayload(decoded)) {
            return (0, exports.sendError)(res, "Invalid token format", 401);
        }
        const user = yield user_model_1.default.findById(decoded._id);
        if (user == null) {
            return (0, exports.sendError)(res, "User not found", 404);
        }
        if (!user.refresh_tokens.includes(refreshToken)) {
            user.refresh_tokens = [];
            yield user.save();
            return (0, exports.sendError)(res, "Invalid refresh token", 401);
        }
        const newaccessToken = yield jsonwebtoken_1.default.sign({ '_id': user._id }, process.env.ACCESS_TOKEN_SECRET, { 'expiresIn': process.env.JWT_TOKEN_EXPIRATION });
        const newrefreshToken = yield jsonwebtoken_1.default.sign({ '_id': user._id }, process.env.REFRESH_TOKEN_SECRET, { 'expiresIn': process.env.JWT_REFRESH_TOKEN_EXPIRATION });
        user.refresh_tokens[user.refresh_tokens.indexOf(refreshToken)];
        yield user.save();
        res.status(200).send({
            'accessToken': newaccessToken,
            'refreshToken': newrefreshToken
        });
    }
    catch (err) {
        return (0, exports.sendError)(res, "Invalid token", 403);
    }
});
exports.default = { login, register, refresh, logout, generateTokens, sendError: exports.sendError };
//# sourceMappingURL=auth_controller.js.map