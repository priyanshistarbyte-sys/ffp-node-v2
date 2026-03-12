require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env")
});
require('module-alias/register');
const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;