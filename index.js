const express = require('express');
const axios = require('axios'); 
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send("GitHub Profile Analyzer API is running smoothly!");
});

app.post('/api/analyze/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const githubResponse = await axios.get(`https://api.github.com/users/${username}`, {
            headers: { 'User-Agent': 'Nodejs-App' }
        });

        const { name, bio, public_repos, followers, following, avatar_url } = githubResponse.data;

        const insertQuery = `
            INSERT INTO tracked_profiles (username, name, bio, public_repos, followers, following, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                bio = VALUES(bio),
                public_repos = VALUES(public_repos),
                followers = VALUES(followers),
                following = VALUES(following),
                avatar_url = VALUES(avatar_url);
        `;

        await db.query(insertQuery, [username, name, bio, public_repos, followers, following, avatar_url]);

        res.status(200).json({
            message: `Successfully analyzed and stored profile for ${username}`,
            data: { username, name, bio, public_repos, followers, following, avatar_url }
        });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: "GitHub user not found!" });
        }
        console.error("Error processing request:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/profiles', async (req, res) => {
    try {
        const [profiles] = await db.query("SELECT * FROM tracked_profiles ORDER BY created_at DESC");

        res.status(200).json(profiles);
    } catch (error) {
        console.error("Error fetching profiles:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/profiles/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const [profiles] = await db.query("SELECT * FROM tracked_profiles WHERE username = ?", [username]);

        if (profiles.length === 0) {
            return res.status(404).json({ error: "Profile not found in database. Analyze it first using POST." });
        }

        res.status(200).json(profiles[0]);
    } catch (error) {
        console.error("Error fetching single profile:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});