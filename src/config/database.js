const mysql = require('mysql2/promise');
const globalConfiguration = require('./config');

const isLive = process.env.DB_HOST && process.env.DB_USER;
const dbConfig = isLive
  ? { host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME }
  : globalConfiguration.db;

const pool = mysql.createPool({
  host: dbConfig.host || 'localhost',
  user: dbConfig.user || 'root',
  password: dbConfig.pwd || dbConfig.password || '',
  database: dbConfig.database || 'festivalpost_test'
});




module.exports = pool;

