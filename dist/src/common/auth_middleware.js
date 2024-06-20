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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_controller_1 = require("../controllers/auth_controller");
const auth_controller_2 = require("../controllers/auth_controller");
function isTokenPayload(payload) {
    return payload && typeof payload === "object" && "_id" in payload;
}
const authenticateMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = (0, auth_controller_2.getTokenFromRequest)(req);
    if (token == null) {
        return (0, auth_controller_1.sendError)(res, "Token required", 401);
    }
    try {
        const decoded = (yield jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET));
        if (!isTokenPayload(decoded)) {
            return (0, auth_controller_1.sendError)(res, "Invalid token data", 403);
        }
        req.body.userId = decoded._id; // Attach user ID directly to the request object
        console.log("Authenticated user ID: " + decoded._id); // Debugging output
        next();
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            return (0, auth_controller_1.sendError)(res, "Token expired", 401);
        }
        console.error(err); // Log the error for debugging
        return (0, auth_controller_1.sendError)(res, "Invalid token", 403);
    }
});
exports.default = authenticateMiddleware;
//# sourceMappingURL=auth_middleware.js.map