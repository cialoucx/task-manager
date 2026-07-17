const app = require('./src/app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Task Manager API listening on http://localhost:${PORT}`);
});
