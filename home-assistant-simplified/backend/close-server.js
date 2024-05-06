import { server } from "./ha-sqlite-api";

// Gracefully close the server
process.on('SIGINT', () => {
    console.log('Closing server...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
});