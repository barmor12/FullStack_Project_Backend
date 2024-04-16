import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import Post_c from '../models/post_model';

let server;

const newPostMessage = 'Bar Mor King';
const newPostSender = 'Bar Mor';
let newPostId = '';

beforeAll(async () => {
    server = app.listen(3000);
    await Post_c.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
    if (server) server.close();
});

describe("posts Tests", () => {

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
        newPostId = response.body._id;
    });
    test("Get all posts", async () => {
        const response = await supertest(app).get('/post');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toBeInstanceOf(Array);
    });
    test("Get post by id", async () => {
        const response = await supertest(app).get('/post/' + newPostId);
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toEqual(newPostMessage);
        expect(response.body.sender).toEqual(newPostSender);
    })

});


