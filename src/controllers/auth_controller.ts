import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user_model';

interface TokenPayload extends JwtPayload {
    _id: string;
}

const generateTokens = (userId: string): { accessToken: string, refreshToken: string } => {
    const accessToken = jwt.sign({
        _id: userId
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.JWT_TOKEN_EXPIRATION
    });

    const refreshToken = jwt.sign({
        _id: userId,
        salt: Math.random()
    }, process.env.REFRESH_TOKEN_SECRET);

    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    }
}
const sendError = (res: Response, message: string, statusCode: number = 400) => {
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

        const accessToken = jwt.sign({ '_id': user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.JWT_TOKEN_EX });
        const refreshToken = jwt.sign({'_id': user._id }, process.env.REFRESH_TOKEN_SECRET);

        user.refresh_tokens.push(refreshToken);
        await user.save();

        res.status(200).send({ accessToken, refreshToken });
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
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return sendError(res, "Authentication missing");
    }

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        if (isTokenPayload(decoded)) {
            const user = await User.findById(decoded._id);
            if (!user || !user.refresh_tokens.includes(token)) {
                return sendError(res, "Invalid refresh token");
            }

            user.refresh_tokens = user.refresh_tokens.filter(t => t !== token);
            await user.save();
            res.status(200).json({ message: "Logged out successfully" });
        } else {
            sendError(res, "Invalid token", 401);
        }
    } catch (err) {
        console.error("Logout error:", err);
        sendError(res, "Authentication failed", 401);
    }
};


const refresh = async (req: Request, res: Response) => {
const authHeader = req.headers['authorization'];
const refreshToken = authHeader && authHeader.split(' ')[1];

    if (refreshToken == null) {
        return sendError(res, "Refresh token required");
    }

  //verify token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo: { _id: string }) => {
    if (err) {
        return res.status(403).send("invalid token");
    }
         
    try {
        const user = await User.findById(userInfo._id);
        if (user == null || user.refresh_tokens == null || !user.refresh_tokens.includes(refreshToken)) {
            if (user.refresh_tokens != null) {
                user.refresh_tokens = [];
                await user.save();
            }
            return res.status(403).send("invalid token");
        }
        // Create new tokens
        const newAccessToken = generateTokens(user._id.toString());
        const newRefreshToken = generateTokens(user._id.toString());

        // Optionally remove old and add new refresh token in database
        user.refresh_tokens = user.refresh_tokens.filter(token => token !== refreshToken);
        user.refresh_tokens.push(newRefreshToken.refreshToken);
        await user.save();

        return res.status(200).send({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (err) {
        console.error("Refresh token error:", err);
        sendError(res, "Failed to refresh token", 401);
    }
});
};
    



// const authenticateMiddleware = async (req: Request, res: Response, next: Function) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if (!token) return sendError(res, "Authentication missing");
//     try {
//         const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//         console.log("Token user: " + decoded);
//         next();
//     } catch (err) {
//         return sendError(res, "Authentication failed");
//     }
// };

export default { login, register, refresh, logout , generateTokens, sendError};