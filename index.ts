import express from 'express';
import path from 'node:path';

import authController from './routes/auth';
import projectsController from './routes/projects';

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

app.use(express.json());
app.use(express.static(FRONTEND_DIR));

app.use('/api/auth', authController);
app.use('/api/admin/projects', projectsController);

app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`NorthernServices Server running on http://localhost:${PORT}`);
});
