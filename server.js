const express = require('express');
var bcrypt = require('bcryptjs');
var cors = require('cors')


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

// const DATABASE = {
//   users: [
//     {
//       id: '1',
//       name: 'Sid',
//       email: 'sid@gmail.com',
//       password: 'hurray',
//       entries: 0,
//       joined: new Date()
//     },
//     {
//       id: '2',
//       name: 'Sally',
//       email: 'sally@gmail.com',
//       password: 'yahoo',
//       entries: 0,
//       joined: new Date()
//     },
//   ]
// }

app.get("/", (req, res) => {
  // res.send(DATABASE.users)
  res.send(db.users)

})

app.post("/signIn", (req, res) => {
  // bcrypt.compare("trees", "$2a$10$Qyb3Pg2yqPWZs4Nm1nsZT.cZXP3AUA5R2jthUHVEgPSRu9SHOoaDi", function (err, res) {
  //   console.log(res);

  // });
  // if (req.body.email === DATABASE.users[0].email && req.body.password === DATABASE.users[0].password) {
  //   //res.json('Success!!')
  //   res.json(DATABASE.users[0]);
  // } else {
  //   res.status(400).json('Error logging in..')
  // }
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json('Please fill your email and password first.')
  }

  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db.select("*").from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('Unable to get User!'))
      }
      else {
        res.status(400).json('Wrong Credentials')
      }
    })
    .catch(err => res.status(400).json('Wrong Credentials!😞 '))
})

app.post('/register', (req, res) => {
  const { email, password, name } = req.body

  if (!email || !name || !password) {
    return res.status(400).json('In order to register,please fill all the three fields!')
  }

  const bcrypt = require('bcryptjs');
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  // we created transaction when we do more than 2 things at ONCE, like when a new use rregister, we want to save its info in 'users' and 'login' table of our DB at ONCE and also for Correct recovery from failures
  db.transaction(trx => {
    trx.insert({
      // RHS hash is the const from above
      hash: hash,
      // RHS email is from req.body above
      email: email
    })
      .into('login') // 'login' is the name of table in DB
      .returning('email')
      .then(loginEmail => {
        return trx('users') //'users' is the name of table in DB
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0])
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
  })
    // DATABASE.users.push({
    //   id: '3',
    //   name: name,
    //   email: email,
    //   password: password,
    //   entries: 0,
    //   joined: new Date()
    // })

    //  .catch(err => res.status(400).json(err))
    .catch(err => res.status(400).json("Unable to register, as the Email address already exists!"))
})

app.get('/profile/:id', (req, res) => {

  //req.params is the the "part of request" we send in the request URL parameter

  const { id } = req.params;

  // DATABASE.users.forEach(user => {
  //   //LHS id refers to what a user fills on UI and RHS id is from DATABASE
  //   if (user.id === id) {
  //     //If user input matches with its values in DATABASE,send that user
  //     found = true;
  //     return res.json(user)
  //   }
  // })

  db.select('*')
    .from('users')
    .where({
      id: id
    })
    .then(user => {
      if (user.length) {

        res.json(user[0])
      } else {
        res.status(400).json('Not Found!!')
      }
    })
    // and if it mismatches
    .catch(err => res.status(400).json('Error getting User'))
})

// to update we use put rquest
app.put('/image', (req, res) => {
  const { id } = req.body;
  // let found = false;
  // DATABASE.users.forEach(user => {
  //   if (user.id === ID) {
  //     //If user input matches with its values in DATABASE,send that user
  //     found = true;
  //     user.entries++
  //     return res.json(user.entries)
  //   }
  // })
  // // and if it mismatches
  // if (!found) {
  //   res.status(400).json('not found')
  // }
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
})

