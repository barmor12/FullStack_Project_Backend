
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user_model';  

function sendError(res: Response, message: string) {
    res.status(400).json({ error: message });
}

export async function register(req: Request, res: Response) {
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

        res.status(200).json(newUser);
    } catch (err) {
        console.error("Registration error:", err);
        sendError(res, "Error during registration");
    }
}

export async function login(req: Request, res: Response) {
    
    res.status(200).send('Login successful');
}

export async function logout(req: Request, res: Response) {
    
    res.status(200).send('Logout successful');
}


export default { login, register, logout };
