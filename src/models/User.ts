var myMongoose = require('mongoose');

const userSchema = new myMongoose.Schema({
    uid: {
        type: String,
        unique: true,
        required: true,        
    },
    username: {
        type: String,
        unique: false,
        required: true,
        min: 1,
        max: 255
    },   
    password:{
        type: String,
        require: true,
        min: 6,
        max: 1024
    },
    dateCreated:{
        type: Date,
        default: Date.now
    },

    // currentEventIndex for an external team to know which notification to display
    // because they didn't want to bother creating an Angular module to listen to RabbitMQ
    // hence we had to go with a continuous API polling solution (which is NOT an industry standard)
    currentEventIndex: { 
        type: Number,
        default: -1
    },
    trophies:{
        type: Array     
    },
    badges:{
        type: Array
    },
    avatarID:{
        type: String,
        default: 'dice'
    }
});


const User = myMongoose.model('User', userSchema);
export {User};