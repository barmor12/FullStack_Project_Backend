"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth_controller"));
const router = express_1.default.Router();
router.post('/login', auth_controller_1.default.login);
router.post('/register', auth_controller_1.default.register);
router.get('/logout', auth_controller_1.default.logout);
router.post('/refresh', auth_controller_1.default.refresh);
exports.default = router;
//# sourceMappingURL=auth_route.js.map