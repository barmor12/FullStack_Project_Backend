"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth_controller"));
const router = express_1.default.Router();
const passport_1 = __importDefault(require("passport"));
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Authentication API
 */
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The user email
 *         password:
 *           type: string
 *           description: The user password
 *         nickname:
 *           type: string
 *           description: The user nickname
 *         profilePic:
 *           type: string
 *           description: The user's profile picture URL
 *       example:
 *         email: 'bob@gmail.com'
 *         password: '123456'
 *         nickname: 'bob'
 *         profilePic: '/uploads/profile.jpg'
 *     Tokens:
 *       type: object
 *       required:
 *         - accessToken
 *         - refreshToken
 *       properties:
 *         accessToken:
 *           type: string
 *           description: The JWT access token
 *         refreshToken:
 *           type: string
 *           description: The JWT refresh token
 *       example:
 *         accessToken: '123cd123x1xx1'
 *         refreshToken: '134r2134cr1x3c'
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registers a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               nickname:
 *                 type: string
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The new user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post("/register", auth_controller_1.default.upload.single("profilePic"), auth_controller_1.default.register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login existing user by email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The access & refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 */
router.post("/login", auth_controller_1.default.login);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     description: Need to provide the refresh token in the body
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The JWT refresh token
 *     responses:
 *       200:
 *         description: Logout completed successfully
 */
router.post("/logout", auth_controller_1.default.logout);
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Get a new access and refresh tokens using the refresh token
 *     tags: [Auth]
 *     description: Need to provide the refresh token in the body
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The JWT refresh token
 *     responses:
 *       200:
 *         description: The access & refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 */
router.post("/refresh", auth_controller_1.default.refresh);
/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get the current logged-in user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/user", auth_controller_1.default.getProfile);
/**
 * @swagger
 * /auth/user:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *               email:
 *                 type: string
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/profile-pic", auth_controller_1.default.upload.single("profilePic"), auth_controller_1.default.updateProfilePic);
router.put("/user", auth_controller_1.default.updateProfile);
/**
 * @swagger
 * /auth/nickname:
 *   put:
 *     summary: Update user nickname
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *     responses:
 *       200:
 *         description: User nickname updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/nickname", auth_controller_1.default.updateNickname);
/**
 * @swagger
 * /auth/password:
 *   put:
 *     summary: Update user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: User password updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/password", auth_controller_1.default.updatePassword);
/**
 * @swagger
 * /auth/check-username:
 *   post:
 *     summary: Check if a username is available
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Username availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   description: Availability status of the username
 *       500:
 *         description: Server error
 */
router.post("/check-username", auth_controller_1.default.checkUsername);
/**
 * @swagger
 * /auth/check-email:
 *   post:
 *     summary: Check if an email is available
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   description: Availability status of the email
 *       500:
 *         description: Server error
 */
router.post("/check-email", auth_controller_1.default.checkEmail);
/**
 * @swagger
 * /auth/validate-password:
 *   post:
 *     summary: Validate the current password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password validation status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   description: Validation status of the password
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/validate-password", auth_controller_1.default.validatePassword);
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google authentication
 *     tags: [Auth]
 *     description: Redirects to Google for authentication
 *     responses:
 *       302:
 *         description: Redirect to Google
 */
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google authentication callback
 *     tags: [Auth]
 *     description: Callback URL for Google authentication
 *     responses:
 *       302:
 *         description: Redirect to home page
 *       401:
 *         description: Unauthorized
 */
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login" }), auth_controller_1.default.googleCallback);
/**
 * @swagger
 * /auth/google/callback:
 *   post:
 *     summary: Handle Google authentication callback
 *     tags: [Auth]
 *     description: Handles the callback after Google authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The ID token from Google
 *     responses:
 *       200:
 *         description: The access & refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       500:
 *         description: Failed to authenticate user
 */
router.post("/google/callback", auth_controller_1.default.googleCallback);
/**
 * @swagger
 * /auth/google/check-user:
 *   post:
 *     summary: Check if a Google user exists
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The ID token from Google
 *     responses:
 *       200:
 *         description: User existence status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: Whether the user exists
 *                 tokens:
 *                   type: object
 *                   $ref: '#/components/schemas/Tokens'
 *       500:
 *         description: Failed to check user
 */
router.post("/google/check-user", auth_controller_1.default.checkGoogleUser);
exports.default = router;
//# sourceMappingURL=auth_route.js.map