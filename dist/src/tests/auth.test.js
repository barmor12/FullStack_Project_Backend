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
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const userEmail = "user2@gmail.com";
const userPassword = "12345";
let accessToken = "";
describe("Auth Tests", () => {
    let server;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        server = server_1.default.listen(3000);
        yield mongoose_1.default.model('User').deleteMany({});
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.close();
        server.close();
    }));
    test("Register test", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post('/auth/register')
            .send({
            email: userEmail,
            password: userPassword
        });
        expect(response.statusCode).toEqual(201);
    }), 10000);
    test("Login test", () => __awaiter(void 0, void 0, void 0, function* () {
        // Login and get the token
        const loginResponse = yield (0, supertest_1.default)(server_1.default)
            .post('/auth/login')
            .send({
            email: userEmail,
            password: userPassword
        });
        expect(loginResponse.statusCode).toEqual(200);
        const accessToken = loginResponse.body.accessToken;
        expect(accessToken).toBeTruthy();
        const postsResponse = yield (0, supertest_1.default)(server_1.default)
            .get('/post')
            .set('Authorization', `Bearer ${accessToken}`); // Correctly setting the authorization header
        expect(postsResponse.statusCode).toEqual(200);
    }), 10000);
});
test("Logout test", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, supertest_1.default)(server_1.default)
        .post('/auth/logout')
        .send();
    expect(response.statusCode).toEqual(200);
}), 10000);
test("Login with wrong password", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, supertest_1.default)(server_1.default)
        .post('/auth/login')
        .send({
        "email": userEmail,
        "password": "wrongpassword"
    });
    expect(response.statusCode).not.toEqual(200);
}), 10000);
test("Login with wrong email", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, supertest_1.default)(server_1.default)
        .post('/auth/login')
        .send({
        "email": "worngemail",
        "password": userPassword
    });
    expect(response.statusCode).not.toEqual(200);
}), 10000);
test("Login with empty email", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, supertest_1.default)(server_1.default)
        .post('/auth/login')
        .send({
        "email": "",
        "password": userPassword
    });
    expect(response.statusCode).not.toEqual(200);
}), 10000);
test("Login with empty password", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, supertest_1.default)(server_1.default)
        .post('/auth/login')
        .send({
        "email": userEmail,
        "password": ""
    });
    expect(response.statusCode).not.toEqual(200);
}), 10000);
test("Register with empty email", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, supertest_1.default)(server_1.default)
        .post('/auth/register')
        .send({
        email: "",
        password: userPassword
    });
    expect(response.statusCode).not.toEqual(201);
}), 10000);
test("Register with empty password", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, supertest_1.default)(server_1.default)
        .post('/auth/register')
        .send({
        email: userEmail,
        password: ""
    });
    expect(response.statusCode).not.toEqual(201);
}), 10000);
test("Register with empty email and password", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, supertest_1.default)(server_1.default)
        .post('/auth/register')
        .send({
        email: "",
        password: ""
    });
    expect(response.statusCode).not.toEqual(201);
}), 10000);
test("Register with existing email", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, supertest_1.default)(server_1.default)
        .post('/auth/register')
        .send({
        email: userEmail,
        password: userPassword
    });
    expect(response.statusCode).not.toEqual(201);
}), 10000);
test("Login with not registered email", () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, supertest_1.default)(server_1.default)
        .post('/auth/login')
        .send({
        "email": "bar1212@gmail.com",
        "password": "12345"
    });
    expect(response.statusCode).not.toEqual(200);
}), 10000);
//# sourceMappingURL=auth.test.js.map