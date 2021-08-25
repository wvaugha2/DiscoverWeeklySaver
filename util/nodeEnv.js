module.exports = {
  CLIENT_ID: process.env.CLIENT_ID || '',
  CLIENT_SECRET: process.env.CLIENT_SECRET || '',
  HOST_URL: process.env.HOST_URL || '',
  REDIRECT_URI: process.env.REDIRECT_URI || '',
  ACCESS_TOKEN: process.env.ACCESS_TOKEN || '',
  REFRESH_TOKEN: process.env.REFRESH_TOKEN || '',
  USER_ID: process.env.USER_ID || '',
  PORT: process.env.PORT || 8888,
  SIGNUP_LIMIT: process.env.SIGNUP_LIMIT,
  CRYPTO_KEY: process.env.CRYPTO_KEY,
  CURRENT_YEAR: `${(new Date()).getFullYear()}`,
  PGUSER: process.env.PGUSER,
  PGHOST: process.env.PGHOST,
  PGPASSWORD: process.env.PGPASSWORD,
  PGDATABASE: process.env.PGDATABASE,
  PGPORT: process.env.PGPORT
}
