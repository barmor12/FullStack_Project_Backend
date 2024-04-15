const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');  

let server;

const newPostMessage = 'Bar Mor King';
const newPostSender = 'Bar Mor';

beforeAll(done => {
    server = app.listen(3000, done);  
});

afterAll(async () => {
    await mongoose.connection.close();  
    server.close();  
});


describe("posts Tests", () => {
    test("Get all posts", async () => {
        const response = await supertest(app).get('/post');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toBeInstanceOf(Array);
    });
    test("Add new post", async () => {
        const response = await supertest(app)
            .post('/post')
            .send({
                message: newPostMessage,  
                sender: newPostSender     
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessage);
        expect(response.body.sender).toEqual(newPostSender);
    });
    
});

    

