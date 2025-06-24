const mongoose = require('mongoose');
const { Schema } = mongoose;

const AppointmentSchema = new Schema({
    appointment_id: String,
    doctor_id: String,
    clinic_patient_id: String,
    name: String,
    note: String,
}, { _id: false });

const PatientSchema = new Schema({
    fullname: { type: String, required: true },
    phone: { type: String, required: true },
    
    gender: { type: String },
    nation: { type: String },
    work_address: { type: String },
    appointments: [AppointmentSchema]
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;
