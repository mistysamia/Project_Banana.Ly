const mongoose = require('mongoose')
const shortId = require('shortid')

const shortUrlSchema = mongoose.Schema({
    full:{
        type: String,
        required: true
    },
    short:{
        type: String,
        required: true,
        default: shortId.generate
    },
    clicks:{
        type: Number,
        required: true,
        default: 0
    },
    userEmail:{
        type: String,
        require: true,
        default: 'admin'
    },
    monetized:{
        type: Boolean,
        require: true,
        default: true
    },
    creationTime:{
        type: Date,
        require: true,
        default: Date()
    }
})

shortUrlSchema.index({
    full: 1,
    userEmail: 1,
    }, {
    unique: true,
});

module.exports = mongoose.model('ShortUrl', shortUrlSchema)