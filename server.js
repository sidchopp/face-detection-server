const express = require('express');
var cors = require('cors')


const db = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'liberal',
    database: 'smart-brain'
  }
});


const app = express();
app.use(express.json());
app.use(cors())

const DATABASE = {
  users: [
    {
      id: '1',
      name: 'Sid',
      email: 'sid@gmail.com',
      password: 'hurray',
      entries: 0,
      joined: new Date()
    },
    {
      id: '2',
      name: 'Sally',
      email: 'sally@gmail.com',
      password: 'yahoo',
      entries: 0,
      joined: new Date()
    },
  ]
}

app.get("/", (req, res) => {
  res.send(DATABASE.users)

})

app.post("/signIn", (req, res) => {
  if (req.body.email === DATABASE.users[0].email && req.body.password === DATABASE.users[0].password) {
    //res.json('Success!!')
    res.json(DATABASE.users[0]);
  } else {
    res.status(400).json('Error logging in..')
  }
})

app.post('/register', (req, res) => {
  const { email, password, name } = req.body
  // DATABASE.users.push({
  //   id: '3',
  //   name: name,
  //   email: email,
  //   password: password,
  //   entries: 0,
  //   joined: new Date()
  // })
  db('users').insert({
    email: email,
    name: name,
    joined: new Date()
  })
    .then(console.log)
  res.json(DATABASE.users[DATABASE.users.length - 1])

})

app.get('/profile/:id', (req, res) => {

  //req.params is the the "part of request" we send in the request URL parameter

  const { id } = req.params;
  let found = false;
  DATABASE.users.forEach(user => {
    //LHS id refers to what a user fills on UI and RHS id is from DATABASE
    if (user.id === id) {
      //If user input matches with its values in DATABASE,send that user
      found = true;
      return res.json(user)
    }
  })
  // and if it mismatches
  if (!found) {
    res.status(400).json('not found')
  }
})

// to update we use put rquest
app.put('/image', (req, res) => {
  const { ID } = req.body;
  let found = false;
  DATABASE.users.forEach(user => {
    if (user.id === ID) {
      //If user input matches with its values in DATABASE,send that user
      found = true;
      user.entries++
      return res.json(user.entries)
    }
  })
  // and if it mismatches
  if (!found) {
    res.status(400).json('not found')
  }

})

app.listen(3000, () => {
  console.log('app is running on 3000');
})

