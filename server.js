require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require(`body-parser`);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

mongoose.connect(process.env.MONGO_PASS, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new mongoose.Schema({
    original_url : {type: String, required: true},
    short_url : Number
  });
let Url = mongoose.model('Url', urlSchema);

app.get(`/api/shorturl/:shorturl`, (req, res) => {
  Url.findOne({short_url: req.params.shorturl}, (err, data) => {
    if(data){
      res.redirect(data['original_url'])
    }
    if(err){
      console.log(err);
    }
  });
})

app.post(`/api/shorturl/new`, bodyParser.urlencoded({extended : false}), (req, res) => { 
  if(!/^https*:\/\//.test(req.body.url)){
    res.json({ error: 'invalid url' });
  }else{
    Url.findOne({original_url : req.body.url}, (err, data) => {
      if(data === null){
        let shortNumber;
        Url.findOne({})
      .sort({short_url: 'desc'})
      .exec((err, data) => {
        if(!err){
          !data ? shortNumber = 1 : shortNumber = data['short_url'] + 1;
          let url = new Url({original_url: req.body.url, short_url: shortNumber});
          url.save((err, data) => {
            if(!err){
              console.log(req.body.url);
            }else{
              console.log(err);
            }
          })
      res.json({original_url : req.body.url, short_url : shortNumber}); 
        }else{
          console.log(err);
        }
      });
      }else if(data){
        res.json({"original_url": data['original_url'],
"short_url": data['short_url']});
      }
    })
  }
});
