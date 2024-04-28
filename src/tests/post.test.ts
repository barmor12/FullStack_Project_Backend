// Import necessary modules and set up test environment
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import Post from '../models/post_model'; // Ensure this is the correct path to your Post model

let server;

const newPostMessage = 'Bar Mor King';
const newPostSender = 'Bar Mor';
let newPostId = '';

beforeAll(async () => {
    server = app.listen(3000);
    // Ensure database is seeded or cleared as needed
    await Post.create({ message: 'Initial Post', sender: 'Initial Sender' });
});

afterAll(async () => {
    await mongoose.connection.close();
    if (server) server.close();
});


// Define the tests suite
describe("posts Tests", () => {
    test("Add new post", async () => {
        const response = await request(app)
            .post('/post')
            .send({
                message: newPostMessage,
                sender: newPostSender
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessage);
        expect(response.body.sender).toEqual(newPostSender);
        newPostId = response.body._id; // Store the ID of the newly created post for further tests
    });

    test("Get all posts", async () => {
        const response = await request(app).get('/post');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    test("Get post by id", async () => {
        const response = await request(app).get(`/post/${newPostId}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessage);
        expect(response.body.sender).toEqual(newPostSender);
    });
    test("get post by sender", async () => {
        const response = await request(app).get('/post?sender=' + newPostSender);
        expect(response.statusCode).toEqual(200);
        expect(response.body[0].message).toEqual(newPostMessage);
        expect(response.body[0].sender).toEqual(newPostSender);
    });

    test("Update post", async () => {
        const response = await request(app)
            .put('/post/' + newPostId)
            .send({
                message: 'Updated message',
                sender: 'Updated sender'
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual('Updated message');
        expect(response.body.sender).toEqual('Updated sender');
    });
    
    // Example test for deleting a post
    test("Delete post", async () => {
        const response = await request(app).delete('/post/' + newPostId);
        expect(response.statusCode).toEqual(200);
    });

    test("Delete post that does not exist", async () => {
        const response = await request(app)
            .delete(`/post/${newPostId}`); // Trying to delete the same post again
        expect(response.statusCode).toEqual(404);
    });
});
