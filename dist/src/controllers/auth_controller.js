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
const user_model_1 = __importDefault(require("../models/user_model"));
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({
        _id: userId
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.JWT_TOKEN_EXPIRATION
    });
    const refreshToken = jsonwebtoken_1.default.sign({
        _id: userId,
        salt: Math.random()
    }, process.env.REFRESH_TOKEN_SECRET);
    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };
};
const sendError = (res, message, statusCode = 400) => {
    if (!res.headersSent) {
        res.status(statusCode).json({ error: message });
    }
};
function isTokenPayload(payload) {
    return payload && typeof payload === 'object' && '_id' in payload;
}
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, "Email and password are required");
    }
    try {
        const user = yield user_model_1.default.findOne({ email });
        if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
            return sendError(res, "Bad email or password");
        }
        const accessToken = jsonwebtoken_1.default.sign({ '_id': user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.JWT_TOKEN_EX });
        const refreshToken = jsonwebtoken_1.default.sign({ '_id': user._id }, process.env.REFRESH_TOKEN_SECRET);
        user.refresh_tokens.push(refreshToken);
        yield user.save();
        res.status(200).send({ accessToken, refreshToken });
    }
    catch (err) {
        console.error("Login error:", err);
        sendError(res, "Failed to login", 500);
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
        const newUser = new user_model_1.default({ email, password: hashedPassword, refresh_tokens: [] });
        yield newUser.save();
        res.status(201).send({ message: "User registered successfully" });
    }
    catch (err) {
        console.error("Registration error:", err);
        sendError(res, "Error during registration", 500);
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return sendError(res, "Authentication missing");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
        if (isTokenPayload(decoded)) {
            const user = yield user_model_1.default.findById(decoded._id);
            if (!user || !user.refresh_tokens.includes(token)) {
                return sendError(res, "Invalid refresh token");
            }
            user.refresh_tokens = user.refresh_tokens.filter(t => t !== token);
            yield user.save();
            res.status(200).json({ message: "Logged out successfully" });
        }
        else {
            sendError(res, "Invalid token", 401);
        }
    }
    catch (err) {
        console.error("Logout error:", err);
        sendError(res, "Authentication failed", 401);
    }
});
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1];
    if (refreshToken == null) {
        return sendError(res, "Refresh token required");
    }
    //verify token
    jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, userInfo) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(403).send("invalid token");
        }
        try {
            const user = yield user_model_1.default.findById(userInfo._id);
            if (user == null || user.refresh_tokens == null || !user.refresh_tokens.includes(refreshToken)) {
                if (user.refresh_tokens != null) {
                    user.refresh_tokens = [];
                    yield user.save();
                }
                return res.status(403).send("invalid token");
            }
            // Create new tokens
            const newAccessToken = generateTokens(user._id.toString());
            const newRefreshToken = generateTokens(user._id.toString());
            // Optionally remove old and add new refresh token in database
            user.refresh_tokens = user.refresh_tokens.filter(token => token !== refreshToken);
            user.refresh_tokens.push(newRefreshToken.refreshToken);
            yield user.save();
            return res.status(200).send({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        }
        catch (err) {
            console.error("Refresh token error:", err);
            sendError(res, "Failed to refresh token", 401);
        }
    }));
});
// const authenticateMiddleware = async (req: Request, res: Response, next: Function) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if (!token) return sendError(res, "Authentication missing");
//     try {
//         const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//         console.log("Token user: " + decoded);
//         next();
//     } catch (err) {
//         return sendError(res, "Authentication failed");
//     }
// };
exports.default = { login, register, refresh, logout, generateTokens, sendError };
//# sourceMappingURL=auth_controller.js.map