const dotenv = require('dotenv');

dotenv.config();

const config = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: 'pellefant.db.elephantsql.com',
    port: 5432,
    dialect: 'postgres',
    operatorsAliases: false
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres'
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];