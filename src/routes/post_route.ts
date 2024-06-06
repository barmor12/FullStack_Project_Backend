/**
 * @swagger
 * tags:
 *  name: Post
 *  description: The Post API
 */

import express from "express";
const router = express.Router();
import post from "../controllers/post_controller";
import authmiddleware from "../common/auth_middleware";
import authController from "../controllers/auth_controller";

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - message
 *         - sender
 *       properties:
 *         message:
 *           type: string
 *           description: The Post Text
 *         sender:
 *           type: string
 *           description: The sender of the post
 *         image:
 *           type: string
 *           description: The path of the image
 *       example:
 *         message: 'this is my new post'
 *         sender: '123456'
 *         image: '/uploads/example.jpg'
 */

/**
 * @swagger
 * /post:
 *   post:
 *     summary: Create a new post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get("/", authmiddleware, post.getAllPosts);

/**
 * @swagger
 * /post/user:
 *   get:
 *     summary: Get posts by the authenticated user
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Failed to get user posts
 *       500:
 *         description: Internal server error
 */
router.get("/user", authmiddleware, post.getUserPosts);

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: get post by id
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The id of the post
 *     responses:
 *       200:
 *         description: the requested post id
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Post'
 */
router.get("/:id", authmiddleware, post.getPostById);
/**
 * @swagger
 * /post:
 *   post:
 *     summary: Create a new post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Data for the new post
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - sender
 *             properties:
 *               message:
 *                 type: string
 *                 description: The content of the post.
 *               sender:
 *                 type: string
 *                 description: The sender's user ID.
 *               image:
 *                 type: string
 *                 description: The path of the image.
 *             example:
 *               message: "Here is a new post about API documentation."
 *               sender: "123456"
 *               image: "/uploads/example.jpg"
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request if the data is invalid
 *       401:
 *         description: Unauthorized if the user is not authenticated
 *       500:
 *         description: Internal server error
 */

router.post(
  "/",
  authController.upload.single("image"),
  authmiddleware,
  post.addNewPost
);
/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     summary: Delete a post by id
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       400:
 *         description: Invalid ID supplied
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

router.delete("/:id", authmiddleware, post.deletePost);
/**
 * @swagger
 * /post/{id}:
 *   put:
 *     summary: Update a post by id
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The content of the post.
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

router.put(
  "/:id",
  authController.upload.single("image"),
  authmiddleware,
  post.updatePost
);

export = router;
