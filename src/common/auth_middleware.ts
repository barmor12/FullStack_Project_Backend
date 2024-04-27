import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Make sure sendError is correctly imported and used.
import Error from '../controllers/auth_controller';

const authenticateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return Error.sendError(res, "Authentication missing"); // Make sure sendError is called correctly.

    try {
        // You should specify the type for the decoded token if possible, for better type safety.
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || ''); // Use a fallback for the secret.
        console.log("Token user: ", decoded);
        next();
    } catch (err) {
        return Error.sendError(res, "Authentication failed"); // Make sure sendError is called correctly.
    }
};

export default authenticateMiddleware;


