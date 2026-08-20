import app from './app';
import { testDatabaseConnection } from './config/database.config';

const PORT = process.env.PORT || 5000;

/**
 * Initializes and starts the Express server
 * Tests database connectivity before starting the server
 * @returns {Promise<void>}
 */
async function startServer() {
  try {
    // Verify database connection before starting the server
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed. Server will start but some features may not work.');
    }

    // Start listening for incoming requests
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: ${dbConnected ? 'Connected' : 'Disconnected'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Global error handlers for uncaught exceptions and unhandled rejections
 * Prevents the application from crashing silently
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Bootstrap the application
startServer();