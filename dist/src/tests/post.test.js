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
const user_model_1 = __importDefault(require("../models/user_model"));
let server;
let accessToken = "";
let refreshToken = "";
const newPostMessage = "Bar Mor King";
const newPostSender = "Bar Mor";
let newPostId = "";
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    server = server_1.default.listen(3000);
    yield mongoose_1.default.model("User").deleteMany({});
    yield mongoose_1.default.model("Post").deleteMany({});
    const newUser = yield user_model_1.default.create({
        email: "user2@gmail.com",
        password: "12345",
        refresh_tokens: [],
    });
    // Register a new user
    const registerResponse = yield (0, supertest_1.default)(server_1.default).post("/auth/register").send({
        email: "user2@gmail.com",
        password: "12345",
    });
    // Login to get the tokens
    const loginResponse = yield (0, supertest_1.default)(server_1.default).post("/auth/login").send({
        email: "user2@gmail.com",
        password: "12345",
    });
    accessToken = loginResponse.body.accessToken;
    refreshToken = loginResponse.body.refreshToken;
    yield post_model_1.default.create({ message: "Initial Post", sender: "Initial Sender" });
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
    if (server)
        server.close();
}));
describe("Auth and posts Tests", () => {
    describe("Auth Tests", () => {
        test("Login Test", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default).post("/auth/login").send({
                email: "user2@gmail.com",
                password: "12345",
            });
            expect(response.statusCode).toEqual(200);
            accessToken = response.body.accessToken;
            expect(accessToken).not.toBeNull();
            refreshToken = response.body.refreshToken;
            expect(refreshToken).not.toBeNull();
            const user1 = yield user_model_1.default.findOne({ email: "user2@gmail.com" });
            expect(user1.refresh_tokens).toContain(refreshToken);
        }));
    });
    describe("posts Tests", () => {
        test("Add new post", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post("/post")
                .set("Authorization", "Bearer " + accessToken)
                .send({
                message: newPostMessage,
                sender: newPostSender,
            });
            console.log("Add new post response:", response.body);
            expect(response.statusCode).toEqual(200);
            expect(response.body.message).toEqual(newPostMessage);
            expect(response.body.sender).toEqual(newPostSender);
            newPostId = response.body._id;
        }));
        test("Get all posts", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .get("/post")
                .set("Authorization", "Bearer " + accessToken);
            console.log("Get all posts response:", response.body);
            expect(response.statusCode).toEqual(200);
            expect(response.body).toBeInstanceOf(Array);
        }));
        test("Get post by id", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .get(`/post/${newPostId}`)
                .set("Authorization", "Bearer " + accessToken);
            console.log("Get post by id response:", response.body);
            expect(response.statusCode).toEqual(200);
            expect(response.body.message).toEqual(newPostMessage);
            expect(response.body.sender).toEqual(newPostSender);
        }));
        test("Get post by sender", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .get("/post?sender=" + newPostSender)
                .set("Authorization", "Bearer " + accessToken);
            console.log("Get post by sender response:", response.body);
            expect(response.statusCode).toEqual(200);
            expect(response.body[0].message).toEqual(newPostMessage);
            expect(response.body[0].sender).toEqual(newPostSender);
        }));
        test("Update post", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .put("/post/" + newPostId)
                .set("Authorization", "Bearer " + accessToken)
                .send({
                message: "Updated message",
                sender: "Updated sender",
            });
            console.log("Update post response:", response.body);
            expect(response.statusCode).toEqual(200);
            expect(response.body.message).toEqual("Updated message");
            expect(response.body.sender).toEqual("Updated sender");
        }));
        test("Delete post", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .delete("/post/" + newPostId)
                .set("Authorization", "Bearer " + accessToken);
            console.log("Delete post response:", response.body);
            expect(response.statusCode).toEqual(200);
        }));
        test("Delete post that does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .delete(`/post/${newPostId}`)
                .set("Authorization", "Bearer " + accessToken);
            expect(response.statusCode).toEqual(404);
        }));
    });
});
//# sourceMappingURL=post.test.js.map