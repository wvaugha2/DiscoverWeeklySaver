const crypto = require('crypto');
const nodeEnv = require('./nodeEnv');
const algorithm = 'aes-256-cbc';

/**
 * @description This function encrypts the provided text using the AES 256 encryption algorithm
 * @param {string} value - the text that should be encrypted
 * @returns {string} the encrypted text value
 */
const encrypt = (value) => {
  try {
    const iv = crypto.randomBytes(8).toString('hex');
    const cipher = crypto.createCipheriv(algorithm, nodeEnv.CRYPTO_KEY, iv);
    let encryption = cipher.update(value, 'utf8', 'hex');
    encryption += cipher.final('hex');
    return { encryption, iv };
  } catch (error) {
    console.error('Error while encrypting:', error);
    return null;
  }
};

/**
 * @description This function decrypts the provided text using the AES 256 encryption algorithm
 * @param {string} value - the text that should be decrypted
 * @param {string} iv - the initialize vector used to encrypt the provided value
 * @returns {string} the decrypted text value
 */
const decrypt = (value, iv) => {
  try {
    const decipher = crypto.createDecipheriv(algorithm, nodeEnv.CRYPTO_KEY, iv);
    let decryption = decipher.update(value, 'hex', 'utf8');
    decryption += decipher.final('utf8');
    return decryption;
  } catch (error) {
    console.error('Error while decrypting:', error);
    return null;
  }
};

module.exports = {
  encrypt,
  decrypt
};
