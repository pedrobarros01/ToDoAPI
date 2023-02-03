const express = require('express');
const cors = require('cors');
const {v4: uuidv4} = require("uuid");

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find(user => user.username === username);
  if(!user){
    return response.status(404).send({error: "Usuário não encontrado"});
  }
  request.user = user;
  return next();

}


function findToDo(id, todos){
  return todos.find(todo => todo.id === id);
}

app.post('/users',(request, response) => {
  const {name, username} = request.body;
  const checkExistUser = users.some(user => user.username === username);
  if(checkExistUser){
    return response.status(400).send({error: "Já existe tal cadastro desse usuário"});
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser);
  return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.status(200).json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;


  const toDoOfUser = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(toDoOfUser)
  return response.json(toDoOfUser);
  

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;
  const {id} = request.params;
  const toDo = findToDo(id, user.todos);
  toDo.title = title;
  toDo.deadline = new Date(deadline);
  return response.status(201).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;
  const toDo = findToDo(id, user.todos);
  toDo.done = true;
  return response.status(200).send();

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;
  const list = user.todos.filter(todo => todo.id !== id);
  console.log(list);
  user.todos = list;
  
  return response.status(200).send();
});

module.exports = app;