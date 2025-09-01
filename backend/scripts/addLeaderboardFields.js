const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const addLeaderboardFields = async () => {
  // ...your provided migration script code...
};

if (require.main === module) {
  addLeaderboardFields();
}

module.exports = addLeaderboardFields;