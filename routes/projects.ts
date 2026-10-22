import express from 'express';

import { getProjects, saveProjects, authenticateAdmin, type Project } from '../utils/helpers';

const projectsController = express.Router();

projectsController.get('/public', async (req, res) => {
    try {
        const projects = await getProjects();
        const publicOnly = projects.filter(p => p.visibility === 'public');

        res.json(publicOnly);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

projectsController.get('/getProjects', authenticateAdmin, async (req, res) => {
    try {
        const projects = await getProjects();

        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

projectsController.post('/sendProjects', authenticateAdmin, async (req, res) => {
    try {
        if (!req.body?.name || !req.body?.desc) {
            return res.status(400).json({ error: 'Project name and description are required' });
        }

        const projects = await getProjects();
        const newProject: Project = {
            id: 'proj_' + Date.now(),
            name: req.body.name,
            category: req.body.category || 'Web App',
            visibility: req.body.visibility === 'private' ? 'private' : 'public',
            desc: req.body.desc,
            url: req.body.url || '',
            status: req.body.status || 'Live & Public',
            tags: Array.isArray(req.body.tags) ? req.body.tags : [],
            createdAt: new Date().toISOString()
        };

        projects.unshift(newProject);

        await saveProjects(projects);
        res.status(201).json(newProject);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

projectsController.put('/sendProjects/:id', authenticateAdmin, async (req, res) => {
    try {
        const projects = await getProjects();

        const index = projects.findIndex(p => p.id === req.params.id);

        if (index === -1) return res.status(404).json({ error: 'Project not found' });

        const existing = projects[index]!;
        projects[index] = {
            ...existing,
            ...req.body,
            id: existing.id,
            createdAt: existing.createdAt
        };

        await saveProjects(projects);
        res.json(projects[index]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});

projectsController.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const projects = await getProjects();

        const remaining = projects.filter(p => p.id !== req.params.id);

        if (remaining.length === projects.length) {
            return res.status(404).json({ error: 'Project not found' });
        }

        await saveProjects(remaining);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

export default projectsController;
