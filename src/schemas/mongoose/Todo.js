import mongoose from 'mongoose'

const TodoMDBSchema = new mongoose.Schema({
    id: Number,
        todo_description: String,
        todo_responsible: String,
        todo_priority: String,
        todo_completed: Boolean
})

const TodoModel = mongoose.model('Todo', TodoMDBSchema);

export default TodoModel;