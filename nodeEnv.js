module.exports = {
    CLIENT_ID: process.env.CLIENT_ID || '',
    CLIENT_SECRET: process.env.CLIENT_SECRET || '',
    REDIRECT_URI: process.env.REDIRECT_URI || '',
    ACCESS_TOKEN: process.env.ACCESS_TOKEN || '',
    REFRESH_TOKEN: process.env.REFRESH_TOKEN || '',
    USER_ID: process.env.USER_ID || '',
    PORT: process.env.PORT || 8888,
    CURRENT_YEAR: `${(new Date()).getFullYear()}`
}