const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const Msg = [
  {msg: 'test'},
  {msg: 'test1234'},
  {msg: 'test12'},
  {msg: 'test14'},
]

// express setup
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// express routes
app.get('/', (req, res) => {
  res.render('../index.ejs', {data: Msg});
});

app.post('/add', (req, res) => {
  if (req.body.msg) {
    Msg.push({msg: req.body.msg});
  }

  res.redirect('/');
});

app.listen(3000);

module.exports = app;
