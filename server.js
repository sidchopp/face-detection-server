const express = require('express');
var bcrypt = require('bcryptjs');
var cors = require('cors');

//components
const register = require('./controllers/register');
const signIn = require('./controllers/signIn');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

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

// app.get("/", (req, res) => { res.send("db.users") })
app.get("/", (req, res) => { res.send("Working!") })
app.post("/signIn", (req, res) => { signIn.handleSignIn(req, res, db, bcrypt) })
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db, bcrypt) })
// to update we use put request
app.put('/image', (req, res) => { image.handleImagePut(req, res, db) })

app.listen(process.env.PORT || 3000, () => {
  console.log(`app is running on ${process.env.PORT}`);
});

