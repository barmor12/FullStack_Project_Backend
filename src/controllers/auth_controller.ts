import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user_model";
import multer from "multer";
import fs from "fs";
import path from "path";

interface TokenPayload extends JwtPayload {
  _id: string;
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_IOS);

export function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  return authHeader.split(" ")[1];
}

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

async function generateTokens(userId: string): Promise<Tokens> {
  const accessToken = jwt.sign(
    { _id: userId },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: process.env.JWT_TOKEN_EXPIRATION! }
  );

  const refreshToken = jwt.sign(
    { _id: userId },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION! }
  );

  return {
    accessToken,
    refreshToken,
  };
}

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400
) => {
  if (!res.headersSent) {
    res.status(statusCode).json({ error: message });
  }
};

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

    const tokens = await generateTokens(user._id.toString());
    user.refresh_tokens.push(tokens.refreshToken);
    await user.save();

    res.status(200).send(tokens);
  } catch (err) {
    console.error("Login error:", err);
    sendError(res, "Failed to login", 500);
  }
};

const register = async (req: Request, res: Response) => {
  const { email, password, nickname } = req.body;
  let profilePic = "";

  if (req.file) {
    profilePic = `/uploads/${req.file.filename}`;
  }

  if (!email || !password) {
    return sendError(res, "Email and password are required");
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      profilePic,
      nickname,
    });

    const newUser = await user.save();
    const tokens = await generateTokens(newUser._id.toString());
    res.status(201).json({ user: newUser, tokens });
  } catch (err) {
    console.error("Registration error:", err);
    sendError(res, "Failed to register", 500);
  }
};

const checkEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({ available: false });
    }
    return res.status(200).json({ available: true });
  } catch (err) {
    console.error("Error checking email availability:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendError(res, "Refresh token is required");
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as TokenPayload;
    const user = await User.findById(payload._id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    user.refresh_tokens = user.refresh_tokens.filter(
      (token) => token !== refreshToken
    );
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    sendError(res, "Failed to logout", 500);
  }
};

const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendError(res, "Refresh token is required");
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as TokenPayload;
    const user = await User.findById(payload._id);
    if (!user || !user.refresh_tokens.includes(refreshToken)) {
      return sendError(res, "Invalid refresh token", 403);
    }

    const tokens = await generateTokens(user._id.toString());
    user.refresh_tokens = user.refresh_tokens.filter(
      (token) => token !== refreshToken
    );
    user.refresh_tokens.push(tokens.refreshToken);
    await user.save();

    res.status(200).json(tokens);
  } catch (err) {
    console.error("Refresh token error:", err);
    sendError(res, "Failed to refresh token", 500);
  }
};

const getProfile = async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return sendError(res, "Token required", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as TokenPayload;
    const user = await User.findById(decoded._id).select(
      "-password -refresh_tokens"
    );
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    res.status(200).send(user);
  } catch (err) {
    console.error("Get profile error:", err);
    sendError(res, "Failed to get profile", 500);
  }
};

const updateProfile = async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return sendError(res, "Token required", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as TokenPayload;
    const user = await User.findById(decoded._id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const { name, email, oldPassword, newPassword } = req.body;

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return sendError(res, "Old password is incorrect", 400);
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (!user.googleId && req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    } else if (user.googleId && req.body.profilePic) {
      user.profilePic = req.body.profilePic;
    }

    user.nickname = name || user.nickname;
    user.email = email || user.email;

    const updatedUser = await user.save();
    res.status(200).send(updatedUser);
  } catch (err) {
    console.error("Update profile error:", err);
    sendError(res, "Failed to update profile", 500);
  }
};
const updateProfilePic = async (req, res) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return sendError(res, "Token required", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    ) as TokenPayload;
    const user = await User.findById(decoded._id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    } else if (req.body.profilePic) {
      user.profilePic = req.body.profilePic;
    }

    const updatedUser = await user.save();
    res.status(200).send(updatedUser);
  } catch (err) {
    console.error("Update profile picture error:", err);
    sendError(res, "Failed to update profile picture", 500);
  }
};

const updateNickname = async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return sendError(res, "Token required", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as TokenPayload;
    const user = await User.findById(decoded._id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const { nickname } = req.body;
    if (!nickname) {
      return sendError(res, "Nickname is required", 400);
    }

    user.nickname = nickname;
    const updatedUser = await user.save();

    res.status(200).send(updatedUser);
  } catch (err) {
    console.error("Update nickname error:", err);
    sendError(res, "Failed to update nickname", 500);
  }
};

const updatePassword = async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return sendError(res, "Token required", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as TokenPayload;
    const user = await User.findById(decoded._id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return sendError(res, "Old and new passwords are required", 400);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return sendError(res, "Old password is incorrect", 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    const updatedUser = await user.save();

    res.status(200).send(updatedUser);
  } catch (err) {
    console.error("Update password error:", err);
    sendError(res, "Failed to update password", 500);
  }
};

const googleCallback = async (req, res) => {
  const { token, password } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID_IOS,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res
        .status(400)
        .json({ error: "Failed to get payload from token" });
    }

    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        nickname: payload.name,
        profilePic: payload.picture,
        password: hashedPassword,
      });
      await user.save();
    } else if (!user.password) {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before saving
      user.password = hashedPassword; // Update the password
      await user.save();
    }

    const tokens = await generateTokens(user._id.toString());
    res.json(tokens);
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
};

const checkGoogleUser = async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID_IOS,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res
        .status(400)
        .json({ error: "Failed to get payload from token" });
    }

    let user = await User.findOne({ googleId: payload.sub });

    if (user) {
      const tokens = await generateTokens(user._id.toString());
      return res.json({ exists: true, tokens });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking Google user:", error);
    res.status(500).json({ error: "Failed to check user" });
  }
};

const checkUsername = async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const user = await User.findOne({ nickname: username });
    if (user) {
      return res.status(200).json({ available: false });
    }

    return res.status(200).json({ available: true });
  } catch (err) {
    console.error("Error checking username availability:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const validatePassword = async (req: Request, res: Response) => {
  const { password } = req.body;
  const token = getTokenFromRequest(req);
  if (!token) {
    return sendError(res, "Token required", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as TokenPayload;
    const user = await User.findById(decoded._id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return res.status(200).json({ valid: true });
    }
    return res.status(200).json({ valid: false });
  } catch (error) {
    console.error("Validate password error:", error);
    sendError(res, "Failed to validate password", 500);
  }
};

export default {
  login,
  register,
  refresh,
  logout,
  generateTokens,
  sendError,
  getProfile,
  upload,
  updateProfile,
  updateProfilePic,
  updateNickname,
  updatePassword,
  googleCallback,
  checkGoogleUser,
  checkUsername,
  checkEmail,
  validatePassword,
};
