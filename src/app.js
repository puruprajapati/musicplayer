const express = require("express");
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const router = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(helmet());
app.use(compression());
app.use(cors());

//make way for custom view
app.use('/views', express.static(__dirname + '/public/views'));

app.use('/api', router);
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'views', 'error-404.html'));
});

app.use(errorHandler);

app.listen(3000, () => {
  console.log('server listening on 3000')
})