const mongoose = require('mongoose')

const adSchema = mongoose.Schema({
    userEmail:{
        type: String,
        require: true
    },
    servedCnt:{
        type: Number,
        require: true,
        default: 0
    },
    remainingCnt:{
        type: Number,
        require: true,
        default: 0
    },
    adType:{
        type: Number,
        require: true
    },
    adEmbed:{
        type: String,
        require: true
    }
})

adSchema.index({
    adType: 1,
    remainingCnt: -1
    }
);

module.exports = mongoose.model('Ad', adSchema)