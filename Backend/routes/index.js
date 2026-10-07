const router = require('express').Router();
const apiRoutes = require('./api');

// Render's health check requests /. A 404 here marks the deploy as failed.
router.get('/', (req, res) => {
  res.json({ message: 'Pro-Tasker API is running.' });
});

router.use('/api', apiRoutes);
 
router.use((req, res) => {
  res.status(404).send('<h1>😝 404 Error!</h1>');
});
 
module.exports = router;