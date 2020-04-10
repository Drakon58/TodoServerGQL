import {buildSchema} from 'graphql'

const TodoSchema = buildSchema(`
    type Todo {
        _id: ID!
        todo_description: String
        todo_responsible: String!
        todo_priority: String!
        todo_completed: Boolean!
    }

    type Query {
        todo(id: ID): Todo
        allTodos: [Todo]
        todos(responsible: String, priority: String): [Todo]
    }

    type Mutation {
        createTodo
        (
            todo_description: String,
            todo_responsible: String!,
            todo_priority: String!,
            todo_completed: Boolean!
        ):String

        editTodo(
            _id: ID
            todo_description: String,
            todo_responsible: String!,
            todo_priority: String!
        ):String
    }
`)

export default TodoSchema;