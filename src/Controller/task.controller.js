const taskSchema = require('../model/task.schema.js');


const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;  
    const task =  await taskSchema.create({ title, description, status, dueDate });
   
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
};

const getTasks = async (req, res) => {
  try {
    const tasks = await taskSchema.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks };