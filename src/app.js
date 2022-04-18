const express = require("express");
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const router = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(helmet());
app.use(compression());
app.use(cors());

//make way for some custom css, js and images
// app.use('/css', express.static(__dirname + '/public/css'));
// app.use('/js', express.static(__dirname + '/public/js'));
// app.use('/images', express.static(__dirname + '/public/images'));

app.use('/api', router);
// app.all('*', )  // not found
app.use(errorHandler);

app.listen(3000, () => {
  console.log('server listening on 3000')
})