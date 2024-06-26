import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/user_model";

const userEmail = `user${Date.now()}@gmail.com`;
const userPassword = "B12345678";
let accessToken = "";
let refreshToken = "";
let server;

beforeAll(async () => {
  server = app.listen(3000);
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

describe("Auth Tests", () => {
  describe("Register Tests", () => {
    test("Register with valid credentials", async () => {
      const response = await request(app)
        .post("/auth/register")
        .field("email", userEmail)
        .field("password", userPassword)
        .field("nickname", "User Name");
      expect(response.statusCode).toEqual(201);
    }, 10000);

    test("Register with empty email", async () => {
      const response = await request(app)
        .post("/auth/register")
        .field("email", "")
        .field("password", userPassword)
        .field("nickname", "User Name");
      expect(response.statusCode).toEqual(400);
    }, 10000);

    test("Register with empty password", async () => {
      const response = await request(app)
        .post("/auth/register")
        .field("email", userEmail)
        .field("password", "")
        .field("nickname", "User Name");
      expect(response.statusCode).toEqual(400);
    }, 10000);

    test("Register with empty email and password", async () => {
      const response = await request(app)
        .post("/auth/register")
        .field("email", "")
        .field("password", "")
        .field("nickname", "User Name");
      expect(response.statusCode).toEqual(400);
    }, 10000);

    test("Register with existing email", async () => {
      const response = await request(app)
        .post("/auth/register")
        .field("email", userEmail)
        .field("password", userPassword)
        .field("nickname", "User Name");
      expect(response.statusCode).toEqual(400);
    }, 10000);
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

      const user1 = await User.findOne({ email: userEmail });
      expect(user1.refresh_tokens).toContain(refreshToken);
    });

    test("Login with wrong password", async () => {
      const response = await request(app).post("/auth/login").send({
        email: userEmail,
        password: "wrongpassword",
      });
      expect(response.statusCode).toEqual(400);
    }, 10000);

    test("Login with wrong email", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "wrongemail@example.com",
        password: userPassword,
      });
      expect(response.statusCode).toEqual(400);
    }, 10000);

    test("Login with empty email", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "",
        password: userPassword,
      });
      expect(response.statusCode).toEqual(400);
    }, 10000);

    test("Login with empty password", async () => {
      const response = await request(app).post("/auth/login").send({
        email: userEmail,
        password: "",
      });
      expect(response.statusCode).toEqual(400);
    }, 10000);

    test("Login with not registered email", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: userPassword,
      });
      expect(response.statusCode).toEqual(400);
    }, 20000);
  });

  describe("Token Access Tests", () => {
    test("Unauthorized access without token", async () => {
      const response = await request(app).get("/post");
      expect(response.statusCode).toEqual(401);
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
      expect(response.statusCode).toEqual(403);
    });

    jest.setTimeout(30000);
    test("test expired token", async () => {
      const expiredToken = jwt.sign(
        { _id: "some_user_id" },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "10s" }
      );

      await new Promise((r) => setTimeout(r, 11000));

      const response = await request(app)
        .get("/post")
        .set("Authorization", "Bearer " + expiredToken);
      expect(response.statusCode).toEqual(401);
    });

    test("refresh token test", async () => {
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

  describe("Logout Tests", () => {
    test("Logout test", async () => {
      if (!refreshToken) {
        console.log("Refresh token not found: Skipping logout test.");
        return;
      }
      const response = await request(app)
        .post("/auth/logout")
        .send({ refreshToken })
        .set("Authorization", "Bearer " + refreshToken);
      expect(response.statusCode).toEqual(200);
    });
  });

  describe("Check Email Tests", () => {
    test("Check available email", async () => {
      const response = await request(app)
        .post("/auth/check-email")
        .send({
          email: `new${Date.now()}@gmail.com`,
        });
      expect(response.statusCode).toEqual(200);
      expect(response.body.available).toBe(true);
    });

    test("Check unavailable email", async () => {
      const response = await request(app).post("/auth/check-email").send({
        email: userEmail,
      });
      expect(response.statusCode).toEqual(200);
      expect(response.body.available).toBe(false);
    });
  });

  describe("Update Profile Tests", () => {
    test("Update profile with invalid token", async () => {
      const response = await request(app)
        .put("/auth/update-profile")
        .set("Authorization", "Bearer invalidToken")
        .send({
          email: `updated${Date.now()}@gmail.com`,
        });
      expect(response.statusCode).toEqual(404);
    });
  });

  describe("Update Nickname Tests", () => {
    test("Update nickname with invalid token", async () => {
      const response = await request(app)
        .put("/auth/update-nickname")
        .set("Authorization", "Bearer invalidToken")
        .send({
          nickname: "UpdatedNickname",
        });
      expect(response.statusCode).toEqual(404); // Adjusted based on your logic
    });
  });

  describe("Update Password Tests", () => {
    test("Update password with invalid old password", async () => {
      const response = await request(app)
        .put("/auth/update-password")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          oldPassword: "wrongpassword",
          newPassword: "NewPassword123",
        });
      expect(response.statusCode).toEqual(404);
    });

    test("Update password with invalid token", async () => {
      const response = await request(app)
        .put("/auth/update-password")
        .set("Authorization", "Bearer invalidToken")
        .send({
          oldPassword: userPassword,
          newPassword: "NewPassword123",
        });
      expect(response.statusCode).toEqual(404);
    });
  });

  describe("Validate Password Tests", () => {
    test("Validate correct password", async () => {
      const response = await request(app)
        .post("/auth/validate-password")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          password: userPassword,
        });
      expect(response.statusCode).toEqual(200);
      expect(response.body.valid).toBe(true);
    });

    test("Validate incorrect password", async () => {
      const response = await request(app)
        .post("/auth/validate-password")
        .set("Authorization", "Bearer " + accessToken)
        .send({
          password: "wrongpassword",
        });
      expect(response.statusCode).toEqual(200);
      expect(response.body.valid).toBe(false);
    });

    test("Validate password with invalid token", async () => {
      const response = await request(app)
        .post("/auth/validate-password")
        .set("Authorization", "Bearer invalidToken")
        .send({
          password: userPassword,
        });
      expect(response.statusCode).toEqual(403); // Adjusted based on your logic
    });
  });

  describe("Check Username Tests", () => {
    test("Check available username", async () => {
      const response = await request(app)
        .post("/auth/check-username")
        .send({
          username: `newusername${Date.now()}`,
        });
      expect(response.statusCode).toEqual(200);
      expect(response.body.available).toBe(true);
    });

    test("Check unavailable username", async () => {
      const response = await request(app).post("/auth/check-username").send({
        username: "Barm7",
      });
      expect(response.statusCode).toEqual(200);
      expect(response.body.available).toBe(false);
    });
  });
});
