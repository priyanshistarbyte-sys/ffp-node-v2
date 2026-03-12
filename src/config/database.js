const mysql = require('mysql2/promise');
const globalConfiguration = require('./config');

const pool = mysql.createPool({
  host: globalConfiguration.db.host || 'localhost',
  user: globalConfiguration.db.user || 'root',
  password: globalConfiguration.db.pwd || '',
  database: globalConfiguration.db.database || 'festivalpost'
});


module.exports = pool;

