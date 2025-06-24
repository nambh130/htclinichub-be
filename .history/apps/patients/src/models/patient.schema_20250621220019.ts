const mongoose = require('mongoose');
const { Schema } = mongoose;

const AppointmentSchema = new Schema({
  appointment_id: String,
  doctor_id: String,
  clinic_patient_id: String,
  name: String,
  note: String,
}, { _id: false }); // Tắt _id phụ vì đây là subdocument

// Define the Patient Schema
const PatientSchema = new Schema({
  fullname: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String },
  nation: { type: String },
  work_address: { type: String },
  appointments: [AppointmentSchema] // Embedded array of appointments
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// Create the Patient model
const Patient = mongoose.model('Patient', PatientSchema);

// Export the model
module.exports = Patient;
