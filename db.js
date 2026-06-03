// 1. Load the mysql2 library
const mysql = require('mysql2');

// 2. Load the environment variables from our .env file
require('dotenv').config();

// 3. Create a configuration pool using our hidden credentials
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 4. Since you don't have a query editor, let's run a startup script 
// to automatically create the table if it's missing!
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tracked_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(150),
        bio TEXT,
        public_repos INT DEFAULT 0,
        followers INT DEFAULT 0,
        following INT DEFAULT 0,
        avatar_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

// We use .query() to send SQL commands to our cloud database
pool.query(createTableQuery, (err, results) => {
    if (err) {
        console.error("❌ Error creating table:", err.message);
    } else {
        console.log("✅ MySQL Table is ready ('tracked_profiles')");
    }
});

// 5. Export the pool so our main server file (index.js) can use it to talk to the DB
module.exports = pool.promise(); // .promise() makes it easier to write modern async JS later