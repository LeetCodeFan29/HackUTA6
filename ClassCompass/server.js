const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path'); // Add this line

const app = express();
const port = 5000;

// Use cors and express.json() middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Update path to your HTML file
});

// Distance calculation endpoint
app.get('/distance', async (req, res) => {
    const { origin, destination, mode } = req.query;

    const apiKey = 'YOURAPIKEY'; // Replace with your actual API key
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=${mode}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log(`response: ${response}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from Google API:', error);
        res.status(500).json({ error: 'Failed to fetch distance data' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
