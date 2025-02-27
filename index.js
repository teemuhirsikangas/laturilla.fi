const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const dotenv = require('dotenv');
const helmet = require('helmet');

// IMPORT MODELS
require('./models/plates');
require('./models/user');
require('./models/messages');
require('./models/subscription');
require('./models/emails');

const app = express();

//disable header, CSP headers, set directly to nginx
app.set('x-powered-by', false);  
app.use(helmet.dnsPrefetchControl());
app.use(helmet.hidePoweredBy());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());

dotenv.config()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//IMPORT ROUTES
require('./routes/plateRoute')(app);
require('./routes/user')(app);
require('./routes/messageRoute')(app);
require('./routes/push')(app);
require('./routes/email')(app);

mongoose.Promise = global.Promise;
async function connect() {

  const options = {
    auth: {
      username: process.env.MONGO_USER,
      password: process.env.MONGO_PASSWORD
    }
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI, options);
  } catch (e) {
    console.log('Could not connect to mongodb:');
    console.log(e);
  }
};

mongoose.connection.on('error', err => {
  console.log('mongoose errors:');
  console.log(err)
});


connect();
if (process.env.NODE_ENV === 'production') {
    console.log(`Running on PRODUCTION mode`);
    app.use(express.static('client/build'));
  
    const path = require('path');
    app.get('*', (req,res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`)
});