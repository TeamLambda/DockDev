const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bodyParser = require('body-parser');
const app = express();

mongoose.connect('mongodb://mongo1:27017/docker-example');

const msgSchema = new Schema({
  msg: String
});

const Msg = mongoose.model('msgs', msgSchema);

// express setup
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// express routes
app.get('/', (req, res) => {
  Msg.find({}, (err, msgs) => {
    res.render('../index2.ejs', {data: msgs});
  });
});

app.post('/add', (req, res) => {
  if (req.body.msg) {
    Msg.create({msg: req.body.msg}, (err, result) => {
      res.redirect('/');
    })
  } else {
    res.redirect('/');
  }
});

app.listen(3000);

module.exports = app;
