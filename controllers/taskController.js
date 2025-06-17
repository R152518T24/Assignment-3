const Task = require('../models/tasks');

exports.getTasks = async (req, res) => {
  try {
    const { status } = req.query; // e.g., /api/tasks?status=pending

    const query = { owner: req.user.id };

    // Add status filter only if it's valid
    if (status && ['pending', 'completed', 'deleted'].includes(status)) {
      query.status = status;
    }

    const tasks = await Task.find(query);
    res.status(200).json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Server error fetching tasks' });
  }
};


exports.createTask = async (req, res) => {
  try {
    const task = new Task({
      title: req.body.title,
      status: req.body.status || 'pending',
      owner: req.user.id
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: 'Task creation failed' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { status: req.body.status },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: 'Task not found or not owned by user' });

    res.status(200).json(task);
  } catch (err) {
    res.status(400).json({ error: 'Task update failed' });
  }
};


exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
