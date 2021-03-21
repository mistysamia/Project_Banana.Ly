const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    userEmail:{
        type: String,
        require: true,
    },
    password:{
        type: String,
        require: true,
    }
})

userSchema.index({
    userEmail: 1,
    }, {
    unique: true,
});

module.exports = mongoose.model('User', userSchema)