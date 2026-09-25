const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctor = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    dob: {
        type: String,
        required: true,
    },
    specialisation: {
        type: String,
        required: true,
    },
    sheduleTimes: {
        type: String,
        required: true,
    },
    locations: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
  type: String,
  required: true,
  select: false,
},
    picture: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});
const doctorSchema = mongoose.model('doctor', doctor);
module.exports = doctorSchema;
