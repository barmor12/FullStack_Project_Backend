
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
        expect(response.statusCode).toEqual(200);
    }, 10000); 

    test("Login test", async () => {
        const response = await supertest(app)
            .post('/auth/login')
            .send({
                email: userEmail,
                password: userPassword
            });
        expect(response.statusCode).toEqual(200);
    }, 10000); 

    test("Logout test", async () => {
        const response = await supertest(app)
            .post('/auth/logout')
            .send();
        expect(response.statusCode).toEqual(200);
    }, 10000); 
});
