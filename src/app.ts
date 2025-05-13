import 'dotenv/config';
import app from './express';
import logger from './logger';

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
