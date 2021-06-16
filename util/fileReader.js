const fs = require('fs');
const path = require('path');

/**
 * @description This function reads a file and returns the contents as a string
 * @param {string} filename - the name of the html file to read
 * @return {string} The contents of the file
 */
const readHtmlFile = (filename) => {
  try {
    const filepath = path.join(__dirname, '..', 'html', filename);
    return fs.readFileSync(filepath, 'utf8');
  } catch (err) {
    return 'Oops! This is embarrassing, looks like something went wrong on our side';
  }
}

module.exports = {
  readHtmlFile
}
