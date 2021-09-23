const handleProfileGet = (req, res, db) => {

  //req.params is the the "part of request" we send in the request URL parameter

  const { id } = req.params;
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
}

module.exports = {
  handleProfileGet: handleProfileGet
}