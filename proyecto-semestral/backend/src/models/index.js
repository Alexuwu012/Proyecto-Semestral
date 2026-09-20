const { connectDB, mongoose } = require('../config/database');
const User = require('./User');
const Report = require('./Report');

module.exports = {
    connectDB,
    mongoose,
    User,
    Report
};
