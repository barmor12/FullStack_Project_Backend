import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user_model';  // Ensure this path matches the location of your user model

function sendError(res: Response, message: string) {
    if (!res.headersSent) {
        res.status(400).json({ error: message });
    }
}

const login = async (req: Request, res: Response) => {
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
            { expiresIn: '1h' }  // Example expiration
        );

        const refreshToken = jwt.sign(
            { _id: user._id.toString() },
            process.env.REFRESH_TOKEN_SECRET
        );

        user.refresh_tokens.push(refreshToken);
        await user.save();

        return res.status(200).json({
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error("Login error:", err);
        return sendError(res, "Failed to login");
    }
};

const refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, "Refresh token required");

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as JwtPayload;
        const user = await User.findById(decoded._id);
        if (!user || !user.refresh_tokens.includes(refreshToken)) {
            return sendError(res, "Invalid refresh token");
        }

        const newAccessToken = jwt.sign(
            { _id: user._id.toString() },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            accessToken: newAccessToken
        });
    } catch (err) {
        console.error("Refresh token error:", err);
        return sendError(res, "Failed to refresh token");
    }
};

const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, "Email and password are required");
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, "User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashedPassword,
            refresh_tokens: []
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Registration error:", err);
        return sendError(res, "Error during registration");
    }
};
const logout = async (req: Request, res: Response) => {
    res.status(200).send('Logout successful');
};

const authenticateMiddleware = async (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return sendError(res, "Authentication missing");
    try {
        const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Token user: " + decoded);
        next();
    } catch (err) {
        return sendError(res, "Authentication failed");
    }
};

export default { login, register, refresh, logout, authenticateMiddleware };
