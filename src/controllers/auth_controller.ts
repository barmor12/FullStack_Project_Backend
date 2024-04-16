import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user_model';
import jwt from 'jsonwebtoken';

function sendError(res: Response, message: string) {
    if (!res.headersSent) {
        res.status(400).json({ error: message });
    }
}

const login= async(req: Request, res: Response)=> {
    const { email, password } = req.body;

    if (!email || !password) {
        return sendError(res, "Email and password are required");
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, "Bad email or password");
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return sendError(res, "Bad email or password");
        }

       
        const accessToken = jwt.sign(
            { _id: user._id.toString() },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.JWT_TOKEN_EXPIRATION }
        );

        return res.status(200).json({ accessToken: accessToken });
    } catch (err) {
        console.error("Login error:", err);
        return sendError(res, "Failed to login");
    }
}

const register=async (req: Request, res: Response)=> {
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, "Email and password are required");
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, "User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ email, password: encryptedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", userId: newUser._id });
    } catch (err) {
        console.error("Registration error:", err);
        sendError(res, "Error during registration");
    }
}

const logout = async(req: Request, res: Response)=>{
    res.status(200).send('Logout successful');
}

const authenticateMiddleware = async (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return sendError(res, "authentication missing");
    try{
       const user = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // req.userid=user._id
        console.log("tokken user: " + user)
        next()
      }catch(err){
        return sendError(res, "authentication failed");
    }
}


export default { login, register, logout, authenticateMiddleware};
