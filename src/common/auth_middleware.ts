import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Assuming sendError is correctly imported from the auth_controller
import { sendError } from '../controllers/auth_controller';
import { getTokenFromRequest } from '../controllers/auth_controller';

interface TokenPayload {
    _id: string;
}

function isTokenPayload(payload: any): payload is TokenPayload {
    return payload && typeof payload === 'object' && '_id' in payload;
}

const authenticateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromRequest(req);
    if (token == null) {
        return sendError(res, "Token required", 401);
    }
    try {
        const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as any;
        if (!isTokenPayload(decoded)) {
            return sendError(res, "Invalid token data", 403);
        }
        req.body.userId = decoded._id;  // Attach user ID directly to the request object
        console.log("Authenticated user ID: " + decoded._id); // Debugging output
        next();
    } catch (err) {
        console.error(err); // Log the error for debugging
        return sendError(res, "Invalid token", 403);
    }
};

export default authenticateMiddleware;
