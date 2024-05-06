import express from 'express';
import pkg from 'sqlite3';
import fetch from 'node-fetch'
import cors from 'cors'

const { Database, OPEN_READONLY } = pkg;
const app = express();
const port = process.env.PORT || 3001;

// Use the cors middleware
app.use(cors())

// Endpoint to log database content to console
app.get('/api/database-content', async (req, res) => {
    try {
      // URL of the remote SQLite database file
      const dbUrl = 'https://hemspup.xyz/config/home-assistant_v2.db';
  
      // Fetch the SQLite database file
      const response = await fetch(dbUrl);

      console.error(response)
  
      // Check if the fetch was successful
      if (!response.ok) {
        throw new Error('Failed to fetch database');
      }
  
      // Extract the response body as a buffer
      const buffer = await response.buffer();

      console.error(buffer)
  
      // Open the SQLite database
      const db = new Database(buffer);
  
      // Example query to select all data from a table
      const query = "SELECT * FROM statistics";
  
      // Execute the query
      db.all(query, (err, rows) => {
        if (err) {
          console.error("Error executing query:", err.message);
          res.status(500).json({ error: "Internal server error" });
        } else {
          // Log the database content to console
          console.log("Database content:");
          console.log(rows);
  
          // Send a success response
          res.json({ message: "Database content logged to console" });
        }
      });
  
      // Close the database connection
      db.close();
    } catch (error) {
      console.error('Error fetching data:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

export {
    server
}
