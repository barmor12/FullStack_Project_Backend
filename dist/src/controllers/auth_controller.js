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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user_model")); // Ensure this path matches the location of your user model
function sendError(res, message) {
    if (!res.headersSent) {
        res.status(400).json({ error: message });
    }
}
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, "Email and password are required");
    }
    try {
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return sendError(res, "Bad email or password");
        }
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match) {
            return sendError(res, "Bad email or password");
        }
        const accessToken = jsonwebtoken_1.default.sign({ _id: user._id.toString() }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' } // Example expiration
        );
        const refreshToken = jsonwebtoken_1.default.sign({ _id: user._id.toString() }, process.env.REFRESH_TOKEN_SECRET);
        user.refresh_tokens.push(refreshToken);
        yield user.save();
        return res.status(200).json({
            accessToken,
            refreshToken
        });
    }
    catch (err) {
        console.error("Login error:", err);
        return sendError(res, "Failed to login");
    }
});
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken)
        return sendError(res, "Refresh token required");
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(decoded._id);
        if (!user || !user.refresh_tokens.includes(refreshToken)) {
            return sendError(res, "Invalid refresh token");
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ _id: user._id.toString() }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        return res.status(200).json({
            accessToken: newAccessToken
        });
    }
    catch (err) {
        console.error("Refresh token error:", err);
        return sendError(res, "Failed to refresh token");
    }
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, "Email and password are required");
    }
    try {
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            return sendError(res, "User already exists");
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new user_model_1.default({
            email,
            password: hashedPassword,
            refresh_tokens: []
        });
        yield newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (err) {
        console.error("Registration error:", err);
        return sendError(res, "Error during registration");
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send('Logout successful');
});
const authenticateMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return sendError(res, "Authentication missing");
    try {
        const decoded = yield jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Token user: " + decoded);
        next();
    }
    catch (err) {
        return sendError(res, "Authentication failed");
    }
});
exports.default = { login, register, refresh, logout, authenticateMiddleware };
//# sourceMappingURL=auth_controller.js.map