const express = require('express');
var bcrypt = require('bcryptjs');
var cors = require('cors');


//components
const register = require('./controllers/register');
const signIn = require('./controllers/signIn');
const profile = require('./controllers/profile');


const db = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    // port: 5432,
    user: 'postgres',
    password: 'liberal',
    database: 'smart-brain'
  }
});


const app = express();
app.use(express.json());
app.use(cors())

app.get("/", (req, res) => {
  // res.send(DATABASE.users)
  res.send(db.users)

})

app.post("/signIn", (req, res) => { signIn.handleSignIn(req, res, db, bcrypt) })

app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })

app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db, bcrypt) })

// to update we use put rquest
app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0])
    })
    .catch(err => res.status(400).json('Unable to get entries'))
})

app.listen(3000, () => {
  console.log('app is running on 3000');
});

