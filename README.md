# GitHub Profile Analyzer API

A simple and optimal backend service built with Node.js and Express.js that analyzes GitHub user profiles using the public GitHub API and tracks insights inside a MySQL database.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL (Hosted via Aiven Cloud)
- **HTTP Client:** Axios
- **Environment Management:** Dotenv

## API Endpoints

### 1. Analyze and Store Profile
- **URL:** `/api/analyze/:username`
- **Method:** `POST`
- **Description:** Fetches profile statistics from GitHub and caches/saves them into the MySQL database.

### 2. Get All Tracked Profiles
- **URL:** `/api/profiles`
- **Method:** `GET`
- **Description:** Returns a list of all profiles that have been analyzed and stored.

### 3. Get Single Profile Details
- **URL:** `/api/profiles/:username`
- **Method:** `GET`
- **Description:** Fetches the saved metrics of a single profile out of the database.

## Local Setup Instructions

1. Clone this repository to your local machine.
2. Run `npm install` to install all dependencies.
3. Create a `.env` file in the root directory and add your MySQL database configurations:
   ```env
   PORT=3000
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   DB_PORT=your_database_port