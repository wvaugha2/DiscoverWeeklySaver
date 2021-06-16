/** STATE VARIABLES */

let numUsers = undefined;

/** STATE VARIABLE MODIFIER FUNCTIONS */

/**
 * @description Returns the number of users signed up for the app
 * @returns {number} the number of users signed up for the app
 */
const getNumUsers = () => {
  return numUsers;
}
  
/**
 * @description Updates the number of users signed up for the app
 * @param {number} newNumUsers - the new number of users
 */
const updateNumUsers = (newNumUsers) => {
  numUsers = newNumUsers;
}

module.exports = {
  getNumUsers,
  updateNumUsers
}
