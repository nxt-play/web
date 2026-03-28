// api/download.js
const axios = require('axios');

export default async function handler(req, res) {
    // 1. Handle the "Pre-flight" request from the browser
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 2. Forward your request to the target server
    try {
        const response = await axios.post('https://media-downloader-app.vercel.app/api/download', req.body);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Bridge failed to connect" });
    }
}
