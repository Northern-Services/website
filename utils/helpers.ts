import fs from 'fs-extra';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';

import { SECRET_KEY } from './config';

const DATA_FILE = path.join(__dirname, 'data', 'projects.json');

export interface Project {
    id: string;
    name: string;
    category: string;
    visibility: 'public' | 'private';
    desc: string;
    url: string;
    status: string;
    tags: string[];
    createdAt: string;
}

export interface AuthenticatedRequest extends Request {
    user?: jwt.JwtPayload;
}

export async function getProjects(): Promise<Project[]> {
    if (!await fs.pathExists(DATA_FILE)) {
        await fs.outputJson(DATA_FILE, []);
        return [];
    }

    const raw = await fs.readFile(DATA_FILE, 'utf8');

    // A freshly created / truncated file should behave like an empty list
    // instead of throwing and turning every request into a 500.
    if (!raw.trim()) {
        return [];
    }

    try {
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data as Project[] : [];
    } catch (err) {
        console.error('projects.json is not valid JSON:', err);
        return [];
    }
}

export async function saveProjects(projects: Project[]): Promise<void> {
    await fs.outputJson(DATA_FILE, projects, { spaces: 2 });
}

export function authenticateAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;

    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });

        if (typeof decoded !== 'object' || decoded === null || decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }

        req.user = decoded;

        next();
    });
}
