import { Multer } from "multer";
import User from "./models/user_model"; // ודא שהנתיב נכון

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
      user?: InstanceType<typeof User>; // שימוש במופע של המודל User
    }
  }
}
