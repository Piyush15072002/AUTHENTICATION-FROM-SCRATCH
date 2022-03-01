const mongoose = require('mongoose');

const schema = mongoose.Schema;

// our user schema
const userSchema = schema({
    username: {
        type: String,
        required: [true, 'Username should be String']
    },
    password: {
        type: String,
        required: [true, 'Password should be there']
    }
});

// user model

const User = mongoose.model('User', userSchema);

// exporting the model 'User'
module.exports = User;