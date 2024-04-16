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
// auth.test.ts
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const userEmail = "user2@gmail.com";
const userPassword = "12345";
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
        expect(response.statusCode).toEqual(200);
    }), 10000);
    test("Login test", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post('/auth/login')
            .send({
            email: userEmail,
            password: userPassword
        });
        expect(response.statusCode).toEqual(200);
    }), 10000);
    test("Logout test", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post('/auth/logout')
            .send();
        expect(response.statusCode).toEqual(200);
    }), 10000);
});
//# sourceMappingURL=auth.test.js.map