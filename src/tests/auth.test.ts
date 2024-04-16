
import supertest from 'supertest';
import app from '../server';  
import mongoose from 'mongoose';

const userEmail = "user2@gmail.com";
const userPassword = "12345";

describe("Auth Tests", () => {
    let server: any;

    beforeAll(async () => {
        server = app.listen(3000);
        
        await mongoose.model('User').deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
        server.close();
    });

    test("Register test", async () => {
        const response = await supertest(app)
            .post('/auth/register')
            .send({
                email: userEmail,
                password: userPassword
            });
        expect(response.statusCode).toEqual(201); 
    }, 10000); 
    

    test("Login test", async () => {
        const response = await supertest(app)
            .post('/auth/login')
            .send({
                "email": userEmail,
                "password": userPassword
            });
        expect(response.statusCode).toEqual(200);
        const token = response.body.accessToken;
        expect(token).toBeTruthy(); 
    }, 10000); 
    
    test("Logout test", async () => {
        const response = await supertest(app)
            .post('/auth/logout')
            .send();
        expect(response.statusCode).toEqual(200);
    }, 10000); 

    test("Login with wrong password", async () => {
        const response = await supertest(app)
            .post('/auth/login')
            .send({
                "email": userEmail,
                "password": "wrongpassword"
            });
        expect(response.statusCode).not.toEqual(200);
    }, 10000);

    test("Login with wrong email", async () => {
        const response = await supertest(app)
            .post('/auth/login')
            .send({
                "email": "worngemail",
                "password": userPassword
            });
        expect(response.statusCode).not.toEqual(200);
    }, 10000);

    test("Login with empty email", async () => {
        const response = await supertest(app)
            .post('/auth/login')
            .send({
                "email": "",
                "password": userPassword
            });
        expect(response.statusCode).not.toEqual(200);
    }, 10000);

    test("Login with empty password", async () => {
        const response = await supertest(app)
            .post('/auth/login')
            .send({
                "email": userEmail,
                "password": ""
            });
        expect(response.statusCode).not.toEqual(200);
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

    test("Login with not registered email", async () => {
        const response = await supertest(app)
            .post('/auth/login')
            .send({
                "email": "bar1212@gmail.com",   
                "password": "12345"
            });
        expect(response.statusCode).not.toEqual(200);
    },
    10000);
});
