import { Request, Response } from 'express';

const login = async (req: Request, res: Response): Promise<void> => {
    console.log(req.body);
    res.status(200).send('Login successful');
};

const register = async (req: Request, res: Response): Promise<void> => {
    res.status(200).send('Registration successful');
};

export default { login, register };
