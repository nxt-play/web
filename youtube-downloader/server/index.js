const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/download', async (req, res) => {
    try {
        const response = await axios.post('https://media-downloader-app.vercel.app/api/download', {
            url: req.body.url
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "API unreachable" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// server/index.js
app.use(cors({
  origin: 'https://yourname.github.io' // Replace with your actual GitHub Pages URL
}));

