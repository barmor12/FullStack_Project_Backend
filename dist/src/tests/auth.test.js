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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userEmail = "user2@gmail.com";
const userPassword = "12345";
let accessToken = "";
let refreshToken = "";
let server;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    server = server_1.default.listen(3000);
    yield mongoose_1.default.model('User').deleteMany({});
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
    server.close();
}));
describe("Auth Tests", () => {
    describe("Register Tests", () => {
        test("Register with valid credentials", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/register')
                .send({
                email: userEmail,
                password: userPassword
            });
            expect(response.statusCode).toEqual(201);
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
    });
    describe("Login Tests", () => {
        test("Login with correct credentials", () => __awaiter(void 0, void 0, void 0, function* () {
            const loginResponse = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/login')
                .send({
                email: userEmail,
                password: userPassword
            });
            expect(loginResponse.statusCode).toEqual(200);
            accessToken = loginResponse.body.accessToken;
            refreshToken = loginResponse.body.refreshToken;
            expect(accessToken).toBeTruthy();
            expect(refreshToken).toBeTruthy();
        }));
        test("Login with wrong password", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/login')
                .send({
                email: userEmail,
                password: "wrongpassword"
            });
            expect(response.statusCode).not.toEqual(200);
        }), 10000);
        test("Login with wrong email", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/login')
                .send({
                email: "wrongemail@example.com",
                password: userPassword
            });
            expect(response.statusCode).not.toEqual(200);
        }), 10000);
        test("Login with empty email", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/login')
                .send({
                email: "",
                password: userPassword
            });
            expect(response.statusCode).not.toEqual(200);
        }), 10000);
        test("Login with empty password", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/login')
                .send({
                email: userEmail,
                password: ""
            });
            expect(response.statusCode).not.toEqual(200);
        }), 10000);
        test("Login with not registered email", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/auth/login')
                .send({
                email: "nonexistent@example.com",
                password: "12345"
            });
            expect(response.statusCode).not.toEqual(200);
        }), 20000);
    });
    describe("Token Access Tests", () => {
        test("Unauthorized access without token", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default).get('/post');
            expect(response.statusCode).not.toEqual(200);
        }));
        test("Authorized access with valid token", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default).get("/post")
                .set('Authorization', 'Bearer ' + accessToken);
            expect(response.statusCode).toEqual(200);
        }));
        test("Unauthorized access with invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default).get('/post')
                .set('Authorization', 'Bearer ' + 'invalidToken');
            expect(response.statusCode).not.toEqual(200);
        }));
        test("test expired token", () => __awaiter(void 0, void 0, void 0, function* () {
            // Simulate token expiration
            jest.spyOn(jsonwebtoken_1.default, 'verify').mockImplementationOnce(() => {
                throw new jsonwebtoken_1.default.JsonWebTokenError('jwt expired');
            });
            const response = yield (0, supertest_1.default)(server_1.default).get("/post")
                .set('Authorization', 'Bearer ' + accessToken);
            expect(response.statusCode).not.toEqual(200);
            jest.restoreAllMocks(); // Restore original functionality after the test
        }));
    });
    describe("Logout Tests", () => {
        test("Logout with valid token", () => __awaiter(void 0, void 0, void 0, function* () {
            if (!refreshToken) {
                console.log("Refresh token not found: Skipping logout test.");
                return;
            }
            const response = yield (0, supertest_1.default)(server_1.default)
                .get('/auth/logout')
                .set('Authorization', `Bearer ${refreshToken}`)
                .send();
            expect(response.statusCode).toEqual(200);
        }));
    });
});
//# sourceMappingURL=auth.test.js.map