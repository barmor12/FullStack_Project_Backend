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
const user_model_1 = __importDefault(require("../models/user_model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
function sendError(res, error) {
    res.status(400).send({
        'err': error
    });
}
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return sendError(res, "Email and password are required");
    }
    try {
        const user = yield user_model_1.default.findOne({ 'email': email });
        if (user) {
            sendError(res, "User already exists");
        }
    }
    catch (err) {
        console.log("Error finding user", +err);
        sendError(res, "Error finding user");
    }
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const encryptedPassword = yield bcrypt_1.default.hash(password, salt);
        const NewUser = new user_model_1.default({
            email: email,
            password: encryptedPassword
        });
        const newUser = yield NewUser.save();
        res.status(200).send(newUser);
    }
    catch (err) {
        console.log("Error generating salt", +err);
        sendError(res, "Error generating salt");
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    res.status(200).send('Login successful');
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    res.status(200).send('Logout successful');
});
exports.default = { login, register, logout };
//# sourceMappingURL=auth_controller.js.map