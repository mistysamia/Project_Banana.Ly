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
        default: 100
    },
    adType:{
        type: String,
        require: true
    },
    adEmbed:{
        type: String,
        require: true
    },
    adRedirect:{
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