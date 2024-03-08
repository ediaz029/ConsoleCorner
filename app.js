const express = require('express');
const path = require('path');
const app = express();

app.use('/stylesheets', express.static(path.join(__dirname, 'stylesheets')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/featured', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'featured.html'));
});

app.listen(4000, () => {
    console.log("listening to port 4000");
});