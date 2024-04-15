const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const postRoute = require('./routes/post_route.js');
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to mongoose'));

app.use('/post', postRoute);
app.listen(process.env.PORT, () => {
    console.log('Server is running on port:', process.env.PORT);
});
