import express from 'express';
const app = express();
import http from 'http';
const server = http.createServer(app);
import dotenv from 'dotenv'
dotenv.config();
import bodyParser from 'body-parser';
app.use(bodyParser.urlencoded({ extended: true,limit:'1mb' }));
app.use(bodyParser.json()); 
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

import mongoose from 'mongoose';
mongoose.connect(process.env.DATABASE_URL);

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to mongo DB'));

app.use('/public',express.static('public'));

import postRouter from './routes/post_route';
import authRouter from './routes/auth_route.js';

app.use('/post', postRouter);
app.use('/auth', authRouter);



if (process.env.NODE_ENV === "development") {
    const options = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "SCE Web Application Backend API",
          version: "1.0.1",
          description: "List all the routes of the backend REST API...",
        },
        servers: [
          {
            url: "http://localhost:" + process.env.PORT,
          },
        ],
      },
      apis: ["./src/routes/*.ts"],
    };
    const specs = swaggerJsDoc(options);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  }

export = server;