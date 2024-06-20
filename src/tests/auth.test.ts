import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import path from "path";

const userEmail = "user2@gmail.com";
const userPassword = "12345";
let accessToken = "";
let refreshToken = "";
let server;

beforeAll(async () => {
  server = app.listen(3000);
  await mongoose.model("User").deleteMany({});
  await mongoose.model("Post").deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

describe("Auth Tests", () => {
  describe("Register Tests", () => {
    test("Register with valid credentials", async () => {
      const response = await request(app).post("/auth/register").send({
        email: userEmail,
        password: userPassword,
        name: "User Two",
      });
      expect(response.statusCode).toEqual(201);
    }, 10000);

    test("Register with empty email", async () => {
      const response = await request(app).post("/auth/register").send({
        email: "",
        password: userPassword,
        name: "User Two",
      });
      expect(response.statusCode).not.toEqual(201);
    }, 10000);

    test("Register with empty password", async () => {
      const response = await request(app).post("/auth/register").send({
        email: userEmail,
        password: "",
        name: "User Two",
      });
      expect(response.statusCode).not.toEqual(201);
    }, 10000);

    test("Register with empty email and password", async () => {
      const response = await request(app).post("/auth/register").send({
        email: "",
        password: "",
        name: "User Two",
      });
      expect(response.statusCode).not.toEqual(201);
    }, 10000);

    test("Register with existing email", async () => {
      const response = await request(app).post("/auth/register").send({
        email: userEmail,
        password: userPassword,
        name: "User Two",
      });
      expect(response.statusCode).not.toEqual(201);
    }, 10000);

    test("Register with profile picture upload", async () => {
      const response = await request(app)
        .post("/auth/register")
        .field("email", "user3@gmail.com")
        .field("password", userPassword)
        .field("name", "User Three")
        .attach("profilePic", path.resolve(__dirname, "test_image.jpg")); // ודא שהקובץ test_image.jpg קיים במיקום זה
      expect(response.statusCode).toEqual(201);
    }, 20000);
  });

  describe("Login Tests", () => {
    test("Login Test", async () => {
      const response = await request(app).post("/auth/login").send({
        email: userEmail,
        password: userPassword,
      });

      expect(response.statusCode).toEqual(200);
      accessToken = response.body.accessToken;
      expect(accessToken).not.toBeNull();
      refreshToken = response.body.refreshToken;
      expect(refreshToken).not.toBeNull();

      const user = await mongoose.model("User").findOne({ email: userEmail });
      expect(user.refresh_tokens).toContain(refreshToken);
    });

    test("Login with wrong password", async () => {
      const response = await request(app).post("/auth/login").send({
        email: userEmail,
        password: "wrongpassword",
      });
      expect(response.statusCode).not.toEqual(200);
      const access = response.body.accessToken;
      expect(access).toBeUndefined();
    }, 10000);

    test("Login with wrong email", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "wrongemail@example.com",
        password: userPassword,
      });
      expect(response.statusCode).not.toEqual(200);
      const access = response.body.accessToken;
      expect(access).toBeUndefined();
    }, 10000);

    test("Login with empty email", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "",
        password: userPassword,
      });
      expect(response.statusCode).not.toEqual(200);
    }, 10000);

    test("Login with empty password", async () => {
      const response = await request(app).post("/auth/login").send({
        email: userEmail,
        password: "",
      });
      expect(response.statusCode).not.toEqual(200);
    }, 10000);

    test("Login with not registered email", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: userPassword,
      });
      expect(response.statusCode).not.toEqual(200);
    }, 20000);
  });

  describe("Token Access Tests", () => {
    test("Unauthorized access without token", async () => {
      const response = await request(app).get("/post");
      expect(response.statusCode).not.toEqual(200);
    });

    test("Test Using valid Access Token:", async () => {
      const response = await request(app)
        .get("/post")
        .set("Authorization", "Bearer " + accessToken);
      expect(response.statusCode).toEqual(200);
    });

    test("Test Using Wrong Access Token:", async () => {
      const response = await request(app)
        .get("/post")
        .set("Authorization", "Bearer 1" + accessToken);
      expect(response.statusCode).not.toEqual(200);
    });

    jest.setTimeout(120000);

    const expiredToken = jwt.sign(
      { _id: "someUserId" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10s" }
    );

    test("Test expired token", async () => {
      await new Promise((r) => setTimeout(r, 12000));
      const response = await request(app)
        .get("/post")
        .set("Authorization", "Bearer " + expiredToken);
      console.log("Expired token test response:", response.body);
      console.log("Expired token status:", response.statusCode);
      expect(response.statusCode).not.toEqual(200);
    });
    test("Refresh token test", async () => {
      let response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken });
      expect(response.statusCode).toEqual(200);

      const newAccessToken = response.body.accessToken;
      expect(newAccessToken).not.toBeNull();
      const newRefreshToken = response.body.refreshToken;
      expect(newRefreshToken).not.toBeNull();

      response = await request(app)
        .get("/post")
        .set("Authorization", "Bearer " + newAccessToken);
      expect(response.statusCode).toEqual(200);
    });
  });

  describe("Profile Tests", () => {
    test("Get profile", async () => {
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", "Bearer " + accessToken);
      console.log("Get profile test response:", response.body); // הוספת לוג כדי לבדוק מה מתקבל
      expect(response.statusCode).toEqual(200);
      expect(response.body.email).toEqual(userEmail);
    });

    test("Update profile", async () => {
      const response = await request(app)
        .put("/auth/profile")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          name: "Updated Name",
        });
      console.log("Update profile test response:", response.body); // הוספת לוג כדי לבדוק מה מתקבל
      expect(response.statusCode).toEqual(200);
      expect(response.body.name).toEqual("Updated Name");
    });
  });

  describe("Google Auth Callback Test", () => {
    test("Google Auth Callback", async () => {
      // This requires a valid Google OAuth token
      // You might want to mock the Google OAuth2Client for testing purposes
      // This is a placeholder test
      expect(true).toBe(true);
    });
  });

  describe("Logout Tests", () => {
    test("Logout test", async () => {
      if (!refreshToken) {
        console.log("Refresh token not found: Skipping logout test.");
        return;
      }
      const response = await request(app)
        .post("/auth/logout")
        .send({ refreshToken });
      expect(response.statusCode).toEqual(200);
    });
  });
});
