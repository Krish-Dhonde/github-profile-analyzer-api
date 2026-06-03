const express = require('express');
const axios = require('axios'); // 1. Import axios to make external API calls
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Root testing route
app.get('/', (req, res) => {
    res.send("GitHub Profile Analyzer API is running smoothly!");
});

// ==========================================
// TASK REQUIREMENT: Fetch & Store Profile Insights
// ==========================================
app.post('/api/analyze/:username', async (req, res) => {
    // Extract the username from the URL parameter (e.g., /api/analyze/octocat)
    const { username } = req.params;

    try {
        // 2. Fetch data from the third-party GitHub Public API
        // Note: GitHub requires a 'User-Agent' header in all API requests
        const githubResponse = await axios.get(`https://api.github.com/users/${username}`, {
            headers: { 'User-Agent': 'Nodejs-App' }
        });

        // Pull out only the relevant insights we need from GitHub's large response
        const { name, bio, public_repos, followers, following, avatar_url } = githubResponse.data;

        // 3. Save or update the data in your MySQL database
        // We use "ON DUPLICATE KEY UPDATE" so if you analyze the same user twice, it updates their stats instead of crashing!
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

        // 4. Send back a clean, successful JSON response to the user
        res.status(200).json({
            message: `Successfully analyzed and stored profile for ${username}`,
            data: { username, name, bio, public_repos, followers, following, avatar_url }
        });

    } catch (error) {
        // Handle common API issues gracefully
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: "GitHub user not found!" });
        }
        console.error("Error processing request:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ==========================================
// TASK REQUIREMENT: Fetch All Stored Analyzed Profiles
// ==========================================
app.get('/api/profiles', async (req, res) => {
    try {
        // Query the database to select all records from our table
        // db.query returns an array where the first element [rows] contains our actual data
        const [profiles] = await db.query("SELECT * FROM tracked_profiles ORDER BY created_at DESC");

        // Send the list back to the client
        res.status(200).json(profiles);
    } catch (error) {
        console.error("Error fetching profiles:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ==========================================
// TASK REQUIREMENT: Fetch Data of a Single Profile from Database
// ==========================================
app.get('/api/profiles/:username', async (req, res) => {
    const { username } = req.params;

    try {
        // Look for the specific user using a parameterized query (?) for security
        const [profiles] = await db.query("SELECT * FROM tracked_profiles WHERE username = ?", [username]);

        // If the array is empty, it means we haven't analyzed this user yet
        if (profiles.length === 0) {
            return res.status(404).json({ error: "Profile not found in database. Analyze it first using POST." });
        }

        // Return just the single profile object (the first item in the match array)
        res.status(200).json(profiles[0]);
    } catch (error) {
        console.error("Error fetching single profile:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});