import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    email: {  
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

export = mongoose.model('User', postSchema);
