const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');  

let server;

beforeAll(done => {
    server = app.listen(3000, done);  
});

afterAll(async () => {
    await mongoose.connection.close();  // Close MongoDB connection
    server.close();  // Then close the server
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
                message: "Bar Mor King",
                sender: "Bar Mor"
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('sender');
    });

    // test("Get post by ID", async () => {
    //     const response = await supertest(app).get('/post/5f5a192f0b2e9a1c6c4d4b8a');
    //     expect(response.statusCode).toEqual(200);
    //     expect(response.body).toHaveProperty('message');
    //     expect(response.body).toHaveProperty('sender');
    // });

    // test("Get post by invalid ID", async () => {
    //     const response = await supertest(app).get('/post/123');
    //     expect(response.statusCode).toEqual(400);
    //     expect(response.body).toHaveProperty('message');
    // });

    // test("Get post by non-existent ID", async () => {
    //     const response = await supertest(app).get('/post/5f5a192f0b2e9a1c6c4d4b8b');
    //     expect(response.statusCode).toEqual(404);
    //     expect(response.body).toHaveProperty('message');
    // });



    // test("Add new post with missing data", async () => {
    //     const response = await supertest(app)
    //         .post('/post')
    //         .send({
    //             message: "Hello, World!"
    //         });
    //     expect(response.statusCode).toEqual(400);
    //     expect(response.body).toHaveProperty('error');
    // });

    
});
