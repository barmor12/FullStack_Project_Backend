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
exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../models/user_model"));
function sendError(res, message) {
    res.status(400).json({ error: message });
}
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        if (!email || !password) {
            return sendError(res, "Email and password are required");
        }
        try {
            const existingUser = yield user_model_1.default.findOne({ email });
            if (existingUser) {
                return sendError(res, "User already exists");
            }
            const salt = yield bcrypt_1.default.genSalt(10);
            const encryptedPassword = yield bcrypt_1.default.hash(password, salt);
            const newUser = new user_model_1.default({ email, password: encryptedPassword });
            yield newUser.save();
            res.status(200).json(newUser);
        }
        catch (err) {
            console.error("Registration error:", err);
            sendError(res, "Error during registration");
        }
    });
}
exports.register = register;
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.status(200).send('Login successful');
    });
}
exports.login = login;
function logout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.status(200).send('Logout successful');
    });
}
exports.logout = logout;
exports.default = { login, register, logout };
//# sourceMappingURL=auth_controller.js.map