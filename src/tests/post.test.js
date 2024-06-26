import request from "supertest";
import mongoose from "mongoose";
import app from "../server";
import Post from "../models/post_model";
import User from "../models/user_model";

let server;
let accessToken = "";
let refreshToken = "";

const newPostMessage = "Bar Mor King";
const newPostSender = "Bar Mor";
let newPostId = "";

beforeAll(async () => {
  server = app.listen(3000);
  // await mongoose.model("User").deleteMany({});
  // await mongoose.model("Post").deleteMany({});
  const newUser = await User.create({
    email: "user2@gmail.com",
    password: "12345",
    refresh_tokens: [],
  });

  // Register a new user
  const registerResponse = await request(app).post("/auth/register").send({
    email: "user2@gmail.com",
    password: "12345",
  });

  // Login to get the tokens
  const loginResponse = await request(app).post("/auth/login").send({
    email: "user2@gmail.com",
    password: "12345",
  });

  accessToken = loginResponse.body.accessToken;
  refreshToken = loginResponse.body.refreshToken;

  console.log("accessToken:", accessToken);
  console.log("refreshToken:", refreshToken);

  await Post.create({ message: "Initial Post", sender: "Initial Sender" });
});

afterAll(async () => {
  await mongoose.connection.close();
  if (server) server.close();
});

describe("Auth and posts Tests", () => {
  describe("Auth Tests", () => {
    test("Login Test", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "user2@gmail.com",
        password: "12345",
      });

      expect(response.statusCode).toEqual(200);
      accessToken = response.body.accessToken;
      expect(accessToken).not.toBeNull();
      refreshToken = response.body.refreshToken;
      expect(refreshToken).not.toBeNull();

      const user1 = await User.findOne({ email: "user2@gmail.com" });
      expect(user1.refresh_tokens).toContain(refreshToken);
    });
  });

  describe("posts Tests", () => {
    test("Add new post", async () => {
      const response = await request(app)
        .post("/post")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          message: newPostMessage,
          sender: newPostSender,
        });

      console.log("Add new post response:", response.body);

      expect(response.statusCode).toEqual(201);
      expect(response.body.post.message).toEqual(newPostMessage);
      expect(response.body.post.sender).toEqual(newPostSender);
      newPostId = response.body.post._id;
    });

    test("Get all posts", async () => {
      const response = await request(app)
        .get("/post")
        .set("Authorization", "Bearer " + accessToken);

      console.log("Get all posts response:", response.body);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toBeInstanceOf(Array);
    });

    test("Get post by id", async () => {
      const response = await request(app)
        .get(`/post/${newPostId}`)
        .set("Authorization", "Bearer " + accessToken);

      console.log("Get post by id response:", response.body);

      expect(response.statusCode).toEqual(200);
      expect(response.body.message).toEqual(newPostMessage);
      expect(response.body.sender).toEqual(newPostSender);
    });

    test("Get post by sender", async () => {
      const response = await request(app)
        .get("/post?sender=" + newPostSender)
        .set("Authorization", "Bearer " + accessToken);

      console.log("Get post by sender response:", response.body);

      expect(response.statusCode).toEqual(200);
      expect(response.body[0].message).toEqual(newPostMessage);
      expect(response.body[0].sender).toEqual(newPostSender);
    });

    test("Update post", async () => {
      const response = await request(app)
        .put("/post/" + newPostId)
        .set("Authorization", "Bearer " + accessToken)
        .send({
          message: "Updated message",
          sender: "Updated sender",
        });

      console.log("Update post response:", response.body);

      expect(response.statusCode).toEqual(200);
      expect(response.body.message).toEqual("Updated message");
      expect(response.body.sender).toEqual("Updated sender");
    });

    test("Delete post", async () => {
      const response = await request(app)
        .delete("/post/" + newPostId)
        .set("Authorization", "Bearer " + accessToken);

      console.log("Delete post response:", response.body);

      expect(response.statusCode).toEqual(200);
    });

    test("Delete post that does not exist", async () => {
      const response = await request(app)
        .delete(`/post/${newPostId}`)
        .set("Authorization", "Bearer " + accessToken);

      expect(response.statusCode).toEqual(404);
    });
  });
});
