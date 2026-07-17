const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const router = express.Router();

// Get all tasks
router.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY section, completed, createdAt DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows.map(row => ({
      ...row,
      completed: Boolean(row.completed)
    })));
  });
});

// Get tasks by section
router.get('/tasks/section/:section', (req, res) => {
  const { section } = req.params;
  db.all(
    'SELECT * FROM tasks WHERE section = ? ORDER BY completed, createdAt DESC',
    [section],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows.map(row => ({
        ...row,
        completed: Boolean(row.completed)
      })));
    }
  );
});

// Create task
router.post('/tasks', (req, res) => {
  const { section, title, priority = 'medium', notes = '' } = req.body;

  if (!section || !title) {
    return res.status(400).json({ error: 'section and title are required' });
  }

  const id = uuidv4();
  const createdAt = new Date().toISOString();

  db.run(
    'INSERT INTO tasks (id, section, title, priority, createdAt, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [id, section, title, priority, createdAt, notes],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id, section, title, priority, completed: false, createdAt, notes });
    }
  );
});

// Update task
router.patch('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { completed, title, notes, priority } = req.body;

  const updates = [];
  const values = [];

  if (completed !== undefined) {
    updates.push('completed = ?');
    values.push(completed ? 1 : 0);
    if (completed) {
      updates.push('completedAt = ?');
      values.push(new Date().toISOString());
    }
  }

  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }

  if (notes !== undefined) {
    updates.push('notes = ?');
    values.push(notes);
  }

  if (priority !== undefined) {
    updates.push('priority = ?');
    values.push(priority);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No updates provided' });
  }

  values.push(id);

  db.run(
    `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, updated: true });
    }
  );
});

// Delete task
router.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id, deleted: true });
  });
});

// Get stats
router.get('/stats', (req, res) => {
  db.all(
    `
    SELECT
      section,
      COUNT(*) as total,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
    FROM tasks
    GROUP BY section
    `,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

module.exports = router;
