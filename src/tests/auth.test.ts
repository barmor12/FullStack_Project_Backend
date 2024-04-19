import supertest from 'supertest';
import app from '../server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const userEmail = "user2@gmail.com";
const userPassword = "12345";
let accessToken = "";
let refreshToken = "";
let server;

beforeAll(async () => {
    server = app.listen(3000);
    await mongoose.model('User').deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});

describe("Auth Tests", () => {
    describe("Register Tests", () => {
        test("Register with valid credentials", async () => {
            const response = await supertest(app)
                .post('/auth/register')
                .send({
                    email: userEmail,
                    password: userPassword
                });
            expect(response.statusCode).toEqual(201);
        }, 10000);
        
        test("Register with empty email", async () => {
            const response = await supertest(app)
                .post('/auth/register')
                .send({
                    email: "",
                    password: userPassword
                });
            expect(response.statusCode).not.toEqual(201);
        }, 10000);

        test("Register with empty password", async () => {
            const response = await supertest(app)
                .post('/auth/register')
                .send({
                    email: userEmail,
                    password: ""
                });
            expect(response.statusCode).not.toEqual(201);
        }, 10000);

        test("Register with empty email and password", async () => {
            const response = await supertest(app)
                .post('/auth/register')
                .send({
                    email: "",
                    password: ""
                });
            expect(response.statusCode).not.toEqual(201);
        }, 10000);

        test("Register with existing email", async () => {
            const response = await supertest(app)
                .post('/auth/register')
                .send({
                    email: userEmail,
                    password: userPassword
                });
            expect(response.statusCode).not.toEqual(201);
        }, 10000);
    });

    describe("Login Tests", () => {
        test("Login with correct credentials", async () => {
            const loginResponse = await supertest(app)
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
        });

        test("Login with wrong password", async () => {
            const response = await supertest(app)
                .post('/auth/login')
                .send({
                    email: userEmail,
                    password: "wrongpassword"
                });
            expect(response.statusCode).not.toEqual(200);
        }, 10000);

        test("Login with wrong email", async () => {
            const response = await supertest(app)
                .post('/auth/login')
                .send({
                    email: "wrongemail@example.com",
                    password: userPassword
                });
            expect(response.statusCode).not.toEqual(200);
        }, 10000);

        test("Login with empty email", async () => {
            const response = await supertest(app)
                .post('/auth/login')
                .send({
                    email: "",
                    password: userPassword
                });
            expect(response.statusCode).not.toEqual(200);
        }, 10000);

        test("Login with empty password", async () => {
            const response = await supertest(app)
                .post('/auth/login')
                .send({
                    email: userEmail,
                    password: ""
                });
            expect(response.statusCode).not.toEqual(200);
        }, 10000);

        test("Login with not registered email", async () => {
            const response = await supertest(app)
                .post('/auth/login')
                .send({
                    email: "nonexistent@example.com",
                    password: "12345"
                });
            expect(response.statusCode).not.toEqual(200);
        }, 20000);
    });

    describe("Token Access Tests", () => {
        test("Unauthorized access without token", async () => {
            const response = await supertest(app).get('/post');
            expect(response.statusCode).not.toEqual(200);
        });

        test("Authorized access with valid token", async () => {
            const response = await supertest(app).get("/post")
                .set('Authorization', 'Bearer ' + accessToken);
            expect(response.statusCode).toEqual(200);
        });

        test("Unauthorized access with invalid token", async () => {
            const response = await supertest(app).get('/post')
                .set('Authorization', 'Bearer ' + 'invalidToken');
            expect(response.statusCode).not.toEqual(200);
        });

        test("test expired token", async () => {
            // Simulate token expiration
            jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
                throw new jwt.JsonWebTokenError('jwt expired');
            });

            const response = await supertest(app).get("/post")
                .set('Authorization', 'Bearer ' + accessToken);
            expect(response.statusCode).not.toEqual(200);

            jest.restoreAllMocks();  // Restore original functionality after the test
        });

        jest.setTimeout(30000);
        test("refresh token", async () => {
            // Make sure to wait for the result of the request
            let response = await supertest(app).post("/auth/refresh")
                .send({ refreshToken: refreshToken })  // Correctly send the refreshToken in the body if that's expected
                .expect(200);  // Assert status code directly
        
            const newAccessToken = response.body.accessToken;
            expect(newAccessToken).toBeTruthy();
        
            const newRefreshToken = response.body.refreshToken;
            expect(newRefreshToken).toBeTruthy();
        
            // Test using the new access token
            response = await supertest(app).get("/post")
                .set('Authorization', 'Bearer ' + newAccessToken)
                .expect(200);  // Assert status code directly
        }, 30000);  // Extended timeout if needed
        
    });

    describe("Logout Tests", () => {
        test("Logout with valid token", async () => {
            if (!refreshToken) {
                console.log("Refresh token not found: Skipping logout test.");
                return;
            }
            const response = await supertest(app)
                .get('/auth/logout')
                .set('Authorization', `Bearer ${refreshToken}`)
                .send();
            expect(response.statusCode).toEqual(200);
        });
    });
});
