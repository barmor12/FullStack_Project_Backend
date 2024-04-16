import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import Post_c from '../models/post_model';

let server;


const userEmail= "user1@gmail.com"
const userPassword= "12345"
beforeAll(async () => {
    server = app.listen(3000);
    await Post_c.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
    if (server) server.close();
});

describe("Auth Tests", () => {

    test("Register test", async () => {
        const response = await supertest(app)
            .post('/auth/register')
            .send({
                email: userEmail,
                password: userPassword
            });
        expect(response.statusCode).toEqual(200);

    });
    test("Login test", async () => {
        const response = await supertest(app).get('/auth/login').send({
            email: userEmail,
            password: userPassword
        
        });
        expect(response.statusCode).toEqual(200);

    });


});


