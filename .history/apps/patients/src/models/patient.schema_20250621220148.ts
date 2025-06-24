const mongoose = require('mongoose');
const { Schema } = mongoose;

const EHRSchema = new Schema({
    appointment_id: String,
    doctor_id: String,
    clinic_patient_id: String,
    name: String,
    note: String,
}, { _id: false });

const Medical = new Schema({
    appointment_id: String,
    doctor_id: String,
    clinic_patient_id: String,
    name: String,
    note: String,
}, { _id: false });

const PatientSchema = new Schema({
    fullname: { type: String, required: true },
    phone: { type: String, required: true },
    dOB: { type: Date, required: true },
    gender: { type: String },
    nation: { type: String },
    work_address: { type: String },
    appointments: [EHRSchema]
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;
