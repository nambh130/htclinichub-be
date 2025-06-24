const mongoose = require('mongoose');
const { Schema } = mongoose;

const MedicalHistorySchema = new Schema({
  allergies: { type: String },
  personal_history: { type: String },
  family_history: { type: String }
}, { _id: false }); 

const PatientSchema = new Schema({
  fullname: { type: String, required: true },
  relation: { type: String },
  ethnicity: { type: String },
  marital_status: { type: String },
  address1: { type: String },
  address2: { type: String },
  phone: { type: String },
  gender: { type: String },
  nation: { type: String },
  work_address: { type: String },
  medical_history: MedicalHistorySchema

}, {
  timestamps: true 
});

// Tạo model
const Patient = mongoose.model('Patient', PatientSchema);

// Export
module.exports = Patient;
