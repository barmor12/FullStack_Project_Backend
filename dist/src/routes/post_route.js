"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const post_controller_1 = __importDefault(require("../controllers/post_controller"));
const auth_controller_1 = __importDefault(require("../controllers/auth_controller"));
router.get('/', auth_controller_1.default.authenticateMiddleware, post_controller_1.default.getAllPosts);
router.get('/:id', post_controller_1.default.getPostById);
router.post('/', post_controller_1.default.addNewPost);
router.delete('/:id', post_controller_1.default.deletePost);
router.put('/:id', post_controller_1.default.updatePost);
module.exports = router;
//# sourceMappingURL=post_route.js.map