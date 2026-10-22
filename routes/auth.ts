import express from 'express';
import jwt from 'jsonwebtoken';

import { SECRET_KEY, authUsername, authPassword } from '../utils/config';

const authController = express.Router();

authController.post('/login', (req, res) => {
    const { username, password } = req.body ?? {};

    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    if (username === authUsername && password === authPassword) {
        try {
            const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '8h' });
            return res.json({ success: true, token, expiresIn: 8 * 60 * 60 });
        } catch (err) {
            console.error('Failed to sign JWT:', err);
            return res.status(500).json({ success: false, error: 'Failed to create session token' });
        }
    }

    return res.status(401).json({ success: false, error: 'Invalid credentials' });
});

export default authController;
