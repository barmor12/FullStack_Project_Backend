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
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = __importDefault(require("../server"));
const post_model_1 = __importDefault(require("../models/post_model"));
let server;
const newPostMessage = 'Bar Mor King';
const newPostSender = 'Bar Mor';
let newPostId = '';
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    server = server_1.default.listen(3000);
    yield post_model_1.default.deleteMany({});
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
    if (server)
        server.close();
}));
describe("posts Tests", () => {
    test("Add new post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post('/post')
            .send({
            message: newPostMessage,
            sender: newPostSender
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessage);
        expect(response.body.sender).toEqual(newPostSender);
        newPostId = response.body._id;
    }));
    test("Get all posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get('/post');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toBeInstanceOf(Array);
    }));
    test("Get post by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get('/post/' + newPostId);
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessage);
        expect(response.body.sender).toEqual(newPostSender);
    }));
});
//# sourceMappingURL=post.test.js.map