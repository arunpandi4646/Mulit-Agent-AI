const express = require('express');
const app = express();
const mongoose = require('mongoose');
const routes = require('./api/routes');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json());
app.use('/api', routes);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});