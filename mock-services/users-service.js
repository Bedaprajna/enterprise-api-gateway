const express = require('express');
const app = express();
const PORT = 5001;

// Disable ETags to force 200 OK responses
app.disable('etag');

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'Users Microservice',
    status: 'Active',
    port: PORT,
    users: [
      { id: 101, name: 'Alice Johnson', role: 'Developer' },
      { id: 102, name: 'Bob Smith', role: 'Admin' }
    ]
  });
});

app.get('/users', (req, res) => {
  res.json({ message: 'Users endpoint reached' });
});

app.listen(PORT, () => {
  console.log(`👤 Users Service running on http://localhost:${PORT}`);
});