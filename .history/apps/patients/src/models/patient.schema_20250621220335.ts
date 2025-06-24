const mongoose = require('mongoose');
const { Schema } = mongoose;

const Medical_Histories = new Schema({
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
    medical_records: [Medical_Histories],
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;
