const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());


app.use(express.static('public'));


app.get('/api/location', (req, res) => {
  fs.readFile('./data/dummyData.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send({ error: 'Error reading data' });
      return;
    }
    const json = JSON.parse(data);
    res.json(json);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

