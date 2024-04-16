import { Request, Response } from 'express';
import User from '../models/user_model';
import bcrypt from 'bcrypt';

function sendError(res:Response , error:String){
    res.status(400).send({
        'err':error
    });
}



const register = async (req: Request, res: Response): Promise<void> => {
    const email = req.body.email;
    const password = req.body.password;
    if(!email || !password){
        return sendError(res, "Email and password are required");
        
    }
    try {
        const user = await User.findOne({ 'email' : email });
        if(user){
            sendError(res, "User already exists");
            
        }
    }catch(err){
        console.log("Error finding user", + err);
        sendError(res, "Error finding user");
        
    }

    try {
        const salt = await bcrypt.genSalt(10);  
        const encryptedPassword = await bcrypt.hash(password, salt);
        const NewUser = new User({
            email: email,
            password: encryptedPassword
        });
        const newUser = await NewUser.save();
        res.status(200).send(newUser);

    }catch(err){    
        console.log("Error generating salt", + err);
        sendError(res, "Error generating salt");
        
    }
}



const login = async (req: Request, res: Response): Promise<void> => {
    console.log(req.body);
    res.status(200).send('Login successful');
};
const logout = async (req: Request, res: Response): Promise<void> => {
    console.log(req.body);
    res.status(200).send('Logout successful');
}


export default { login, register, logout};
