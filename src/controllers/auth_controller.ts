import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user_model';

interface TokenPayload extends JwtPayload {
    _id: string;
}
export function getTokenFromRequest(req: Request): string | null{
    const authHeader = req.headers['authorization'];
    if (authHeader == null ) return null
    return authHeader.split(' ')[1];
}

type Tokens = {
    accessToken: string;
    refreshToken: string;
};

// Async function to generate access and refresh tokens
async function generateTokens(userId: string): Promise<Tokens> {
    const accessToken = await jwt.sign(
        { '_id': userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.JWT_TOKEN_EXPIRATION }
    );

    const refreshToken = await jwt.sign(
        { '_id': userId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION }
    );

    return {
        'accessToken': accessToken,
        'refreshToken':refreshToken
    };
}


export const sendError = (res: Response, message: string, statusCode: number = 400) => {
    if (!res.headersSent) {
        res.status(statusCode).json({ error: message });
    }
};

function isTokenPayload(payload: any): payload is TokenPayload {
    return payload && typeof payload === 'object' && '_id' in payload;
}

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, "Email and password are required");
    }
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return sendError(res, "Bad email or password");
        }

        // Convert ObjectId to string and use generateTokens function to simplify token creation
        const tokens = await generateTokens(user._id.toString());
        if (user.refresh_tokens == null) user.refresh_tokens = [tokens.refreshToken];
        else user.refresh_tokens.push(tokens.refreshToken);
        await user.save();

        res.status(200).send(tokens);
    } catch (err) {
        console.error("Login error:", err);
        sendError(res, "Failed to login", 500);
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
        const newUser = new User({ email, password: hashedPassword, refresh_tokens: [] });
        await newUser.save();

        res.status(201).send({ message: "User registered successfully" });
    } catch (err) {
        console.error("Registration error:", err);
        sendError(res, "Error during registration", 500);
    }
};

const logout = async (req: Request, res: Response) => {

    const refreshToken = getTokenFromRequest(req);
    if (refreshToken == null) {
        return sendError(res, "Token required", 401);
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!isTokenPayload(decoded)) {
            return sendError(res, "Invalid token format", 401);
        }
        const user = await User.findById(decoded._id);
        if (user == null) {
            return sendError(res, "User not found", 404);
        }

        if (!user.refresh_tokens.includes(refreshToken)) {
            user.refresh_tokens = [];
            await user.save();
            return sendError(res, "Invalid refresh token", 401);
        }
        user.refresh_tokens.splice(user.refresh_tokens.indexOf(refreshToken), 1);
        await user.save();
        res.status(200).send({ message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err);
        sendError(res, "Failed to logout", 500);
    }
};


const refresh = async (req: Request, res: Response) => {
    const refreshToken = getTokenFromRequest(req);
    if (refreshToken == null) {
        return sendError(res, "Token required", 401);
    }
    try{
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!isTokenPayload(decoded)) {
            return sendError(res, "Invalid token format", 401);
        }
        const user = await User.findById(decoded._id);
        if (user == null) {
            return sendError(res, "User not found", 404);
        }
        if (!user.refresh_tokens.includes(refreshToken)) {
            user.refresh_tokens = []
            await user.save();
            return sendError(res, "Invalid refresh token", 401);
        }

        const newaccessToken = await jwt.sign(
            { '_id': user._id }
            , process.env.ACCESS_TOKEN_SECRET,
            {'expiresIn':process.env.JWT_TOKEN_EXPIRATION});
        const newrefreshToken = await jwt.sign(
            { '_id': user._id }
            , process.env.REFRESH_TOKEN_SECRET, 
            {'expiresIn': process.env.JWT_REFRESH_TOKEN_EXPIRATION });

            user.refresh_tokens[user.refresh_tokens.indexOf(refreshToken)]
            await user.save();

            
        res.status(200).send({ 
            'accessToken': newaccessToken,
            'refreshToken': newrefreshToken
        });


    }catch(err){
        return sendError(res, "Invalid token", 403);
    }
};
export default { login, register, refresh, logout , generateTokens, sendError};