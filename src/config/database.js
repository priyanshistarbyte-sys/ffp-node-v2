const mysql = require('mysql2/promise');
const globalConfiguration = require('config');

const pool = mysql.createPool({
  host: globalConfiguration.db_live.host || 'localhost',
  user: globalConfiguration.db_live.user || 'root',
  password: globalConfiguration.db_live.pwd || '',
  database: globalConfiguration.db_live.database || 'festivalpost'
});


module.exports = pool;

