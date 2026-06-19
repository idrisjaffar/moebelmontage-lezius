const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve all the HTML, CSS, and JS files in your current folder
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`🚀 Server is live! Open your browser and go to http://localhost:${PORT}`);
});