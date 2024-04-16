import express from 'express';
const app = express();
import dotenv from 'dotenv'
dotenv.config();
import bodyParser from 'body-parser';
app.use(bodyParser.urlencoded({ extended: true,limit:'1mb' }));
app.use(bodyParser.json()); 


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


export = app;