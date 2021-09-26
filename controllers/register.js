const handleRegister = (req, res, db, bcrypt) => {
  const { email, password, name } = req.body

  if (!email || !name || !password) {
    return res.status(400).json('In order to register,please fill all the three fields!')
  }

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
    .catch(err => res.status(400).json("Unable to register"))
}

module.exports = {
  handleRegister: handleRegister
}