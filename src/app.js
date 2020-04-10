import config from '../config/config'

import express from 'express'
import { buildSchema } from 'graphql'
import graphqlHTTP from 'express-graphql'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose';

import TodoGQLSchema from './schemas/graphql/Todo'
import TodoMDBModel from './schemas/mongoose/Todo'

const PORT = config.PORT;
const MONGODB_ADRESS = config.TodoDB

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

const todoRouter = express.Router();

mongoose.connect(MONGODB_ADRESS, { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function () {
    console.log("MongoDB database connection established successfully!");
})

const testDataSet = [
    {
        id: 1,
        value: 'Hello world',
        subInfo: {
            subInfoValue: 'sub info1',
            subInfoValue2: 1
        }
    },
    {
        id: 2,
        value: 'Hello world',
        subInfo: {
            subInfoValue: 'sub info2',
            subInfoValue2: 2
        }
    },
    {
        id: 2,
        value: 'Hello world x2',
        subInfo: {
            subInfoValue: 'sub info2x2',
            subInfoValue2: 3
        }
    }
];

var testSchema = buildSchema(`
    type Query {
        hello(id: ID): Hello
        hellos(id: ID): [Hello]
        subInfo: SubInfo
    }

    type Hello {
        id: ID!
        value: String
        subInfo: SubInfo
    }

    type SubInfo {
        subInfoValue: String
        subInfoValue2: Int
    }
`)

var testRoot = {
    hello: ({ id }) => {
        let temp = id === null ? null : testDataSet.find(x => {
            console.log(`x is: ${x.id} and passed in id is: ${id} and matches? ${x.id == id}`);
            return x.id == id
        });

        console.log(temp);

        return temp;
    },
    hellos: ({ id }) => {
        let temp = id === null ? null : testDataSet.filter(x => {
            console.log(`x is: ${x.id} and passed in id is: ${id} and matches? ${x.id == id}`);
            return x.id == id
        });

        console.log(temp);

        return temp;
    },
    subInfo: () => {
        return {
            subInfoValue: 'sub info',
            subInfoValue2: 5
        }
    }
}

var TodoMongoDBRoot = {
    todo: ({ id }) => {
        console.log("Going through Todo route");
        let temp = TodoMDBModel.findById(id);
        console.log(`Info returned is ${temp}`)
        return temp
    },
    allTodos: () => {
        console.log("Going through Todo route");
        let temp = TodoMDBModel.find();
        console.log(`Infos returned are ${temp}`)
        return temp
    },
    createTodo: ({ todo_description, todo_responsible, todo_priority, todo_completed }) => {
        let todoModel = new TodoMDBModel({
            "todo_description": todo_description,
            "todo_responsible": todo_responsible,
            "todo_priority": todo_priority,
            "todo_completed": todo_completed
        });
        console.log(`Got a create request for ${todo_description}, ${todo_responsible}, ${todo_priority}, ${todo_completed}`);

        todoModel.save()
            .then(todo => {
                console.log(`Infos returned from create are ${todoModel}`)
            })
            .catch(err => {
                console.log(`Failed to create new todo item`)
            });
    },
    editTodo: ({ _id, todo_description, todo_responsible, todo_priority }) => {
        TodoMDBModel.findById(_id, (err, todo) => {
            if (!todo) {
               console.log(`data is not found, ${err}`);
            } else {
                todo.todo_description = todo_description;
                todo.todo_responsible = todo_responsible;
                todo.todo_priority = todo_priority;

                todo.save().then(todo => {
                    console.log('Todo updated!');
                })
                    .catch(err => {
                        console.log("Update not possible");
                    });
            }
        });
    }
    // ,
    // Todos: () => {
    //     console.log("Going through Todo route");
    //     let temp = TodoMDBModel.findById(id);
    //     console.log(`Infos returned is ${temp}`)
    //     return temp

    // }
}

app.use('/graphql', graphqlHTTP({
    schema: TodoGQLSchema,
    rootValue: TodoMongoDBRoot,
    graphiql: true,
}))

app.listen(PORT, function () {
    console.log("Server is running on Port with: " + PORT);
});