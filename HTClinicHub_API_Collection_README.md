# HTClinicHub API Gateway - Postman Collection

## 📋 Overview

This comprehensive Postman collection provides complete coverage of both the HTClinicHub API Gateway (port 3000) and the direct Auth Service (port 3001) endpoints. The collection is organized into logical folders with sample data and automated testing capabilities, with endpoints from both services categorized together for logical workflow organization.

## 🏗️ Dual Service Architecture

HTClinicHub uses a microservice architecture with two main entry points:

### 🚪 API Gateway (Port 3000)

- **Purpose**: Main entry point for most application requests
- **Path**: `http://localhost:3000/api`
- **Features**: Request routing, load balancing, authentication proxy
- **Use Case**: Frontend applications, mobile apps, external integrations

### 🔐 Auth Service (Port 3001)

- **Purpose**: Direct authentication and authorization service
- **Path**: `http://localhost:3001`
- **Features**: User management, roles, permissions, invitations, JWT handling
- **Use Case**: Direct service-to-service communication, administrative tasks

### 📋 Why Both Services?

Each endpoint category includes both Gateway and Direct Auth Service requests to support:

- **Development Testing**: Compare Gateway vs Direct responses
- **Service Debugging**: Isolate issues to specific services
- **Administrative Tasks**: Direct access to auth features
- **Performance Testing**: Compare routing overhead

## 📁 Collection Structure

### 🔐 Authentication

- **Patient Authentication**: OTP-based login for patients (Gateway + Direct Auth Service)
- **Staff Authentication**: Email/password login for clinic staff and doctors (Gateway + Direct Auth Service)
- **Invitation System**: Staff invitation creation and management (Gateway + Direct Auth Service)
- **Token Management**: Refresh tokens and logout (Gateway + Direct Auth Service)
- **Password Management**: Password recovery and reset (Gateway + Direct Auth Service)
- **Roles & Permissions**: Complete role and permission management (Gateway + Direct Auth Service)

### 🏥 Clinic Management

- **Clinic CRUD**: Create, read, update, delete clinic operations
- **Staff Management**: View and search clinic staff members
- **Schedule Rules**: Clinic scheduling configuration

### 👨‍⚕️ Staff Management

- **Doctor Management**: Complete doctor lifecycle management
  - Account Management
  - Profile Management
  - Degrees Management
  - Specializations
  - Schedule Management
  - Clinic Assignment
- **Employee Management**: Complete employee lifecycle management
  - Account Management
  - Profile Management
  - Degrees & Certifications
  - Clinic Assignment

### 👥 Patient Management

- **Patient CRUD**: Complete patient management
- **Favourite Doctors**: Patient's favorite doctor lists
- **Medical Records**: Patient medical history
- **Appointments**: Appointment scheduling and management
- **Patient-Clinic Relations**: Clinic assignments

### 📁 Media Management

- **Image Management**: Upload/manage images (single/multiple)
- **PDF Management**: Upload/manage PDF documents
- **Document Management**: Upload/manage various document types
- **File Operations**: Get, replace, and delete files

### 📊 Healthcare Data Analysis

- **Vital Signs Management**: Input and track patient vital signs

## 🚀 Getting Started

### 1. Import the Collection

1. Open Postman
2. Click "Import"
3. Select `HTClinicHub_API_Collection.json`
4. The collection will be imported with all folders and requests

### 2. Import the Environment

1. Click "Import" again
2. Select `HTClinicHub_Environment.json`
3. Set this as your active environment

### 3. Configure Base URLs

Update the URLs in your environment for both services:

**API Gateway (Port 3000):**

- **Local Development**: `http://localhost:3000/api`
- **Staging**: `https://staging-api.htclinichub.com/api`
- **Production**: `https://api.htclinichub.com/api`

**Auth Service (Port 3001):**

- **Local Development**: `http://localhost:3001`
- **Staging**: `https://staging-auth.htclinichub.com`
- **Production**: `https://auth.htclinichub.com`

## 🔑 Authentication Flow

### For Staff/Admin Testing:

1. **Login**: Use "Clinic User Login" or "Admin Login"
2. **Automatic Token Storage**: Tokens are automatically stored in environment variables
3. **Authorization**: Most requests use `{{staff_token}}` automatically

### For Patient Testing:

1. **Request OTP**: Use "Request OTP" with phone number
2. **Verify OTP**: Use "Verify OTP" with received code
3. **Token Storage**: Patient token stored as `{{patient_token}}`

## 📝 Sample Data Examples

### Authentication

```json
// Staff Login
{
  "email": "doctor@clinic.com",
  "password": "securePassword123"
}

// Patient OTP Request
{
  "phone": "+84901234567",
  "password": "optionalPassword123"
}
```

### Clinic Creation

```json
{
  "name": "Main Medical Center",
  "location": "123 Healthcare Street, Medical District",
  "phone": "+84901234567",
  "email": "contact@mainmedical.com",
  "description": "Comprehensive healthcare services",
  "operatingHours": {
    "monday": { "open": "08:00", "close": "18:00" },
    "tuesday": { "open": "08:00", "close": "18:00" }
  }
}
```

### Doctor Creation

```json
{
  "email": "newdoctor@clinic.com",
  "password": "doctorPassword123",
  "firstName": "Dr. John",
  "lastName": "Smith",
  "phone": "+84901234567",
  "dateOfBirth": "1985-03-15",
  "gender": "male",
  "address": "123 Medical Street",
  "clinicId": "{{current_clinic_id}}"
}
```

### Patient Creation

```json
{
  "firstName": "John",
  "lastName": "Patient",
  "email": "john.patient@email.com",
  "phone": "+84901234569",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "emergencyContact": {
    "name": "Jane Patient",
    "relationship": "spouse",
    "phone": "+84901234570"
  },
  "medicalHistory": {
    "allergies": ["Penicillin", "Shellfish"],
    "chronicConditions": ["Hypertension"],
    "medications": ["Lisinopril 10mg daily"]
  }
}
```

### Vital Signs Input

```json
{
  "patientId": "{{created_patient_id}}",
  "recordedDate": "2024-01-15T10:30:00Z",
  "vitalSigns": {
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80,
      "unit": "mmHg"
    },
    "heartRate": {
      "value": 72,
      "unit": "bpm"
    },
    "temperature": {
      "value": 36.5,
      "unit": "celsius"
    },
    "weight": {
      "value": 70.5,
      "unit": "kg"
    },
    "height": {
      "value": 175,
      "unit": "cm"
    }
  }
}
```

## 🔄 Environment Variables

The collection uses environment variables for dynamic data:

### Service URLs

- `base_url`: API Gateway base URL (port 3000)
- `auth_service_url`: Direct Auth Service URL (port 3001)
- `staging_url`: API Gateway staging URL
- `staging_auth_url`: Auth Service staging URL
- `production_url`: API Gateway production URL
- `production_auth_url`: Auth Service production URL

### Authentication Tokens

- `patient_token`: JWT token for patient requests
- `staff_token`: JWT token for staff requests
- `admin_token`: JWT token for admin requests
- `refresh_token`: Token for refreshing authentication

### Entity IDs (Auto-populated)

- `current_user_id`: Currently authenticated user
- `current_clinic_id`: Current clinic context
- `created_doctor_id`: Recently created doctor
- `created_employee_id`: Recently created employee
- `created_patient_id`: Recently created patient
- `created_appointment_id`: Recently created appointment
- `created_role_id`: Recently created role
- `created_permission_id`: Recently created permission

### File Management

- `uploaded_image_id`: Recently uploaded image
- `medical_record_id`: Medical record for testing

## 🧪 Testing Features

### Automated Token Storage

Login requests automatically store tokens in environment variables:

```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  if (response.token) {
    pm.environment.set('staff_token', response.token);
  }
}
```

### ID Extraction

Create requests automatically store generated IDs:

```javascript
if (pm.response.code === 201) {
  const response = pm.response.json();
  if (response.id) {
    pm.environment.set('created_doctor_id', response.id);
  }
}
```

### Error Logging

Global error handling logs response details for debugging.

## 📋 Testing Workflows

### 1. Complete Staff Workflow

1. Login as staff member
2. Create a clinic
3. Create doctor account
4. Add doctor profile, degrees, specializations
5. Set up working schedule
6. Create employee account
7. Add employee profile

### 2. Patient Care Workflow

1. Login as staff
2. Create patient record
3. Input vital signs
4. Create appointment
5. Upload medical documents
6. Update medical records

### 3. Media Management Workflow

1. Upload patient photos
2. Upload medical documents
3. Replace outdated files
4. Delete unnecessary files

## 🔧 Advanced Features

### File Uploads

The collection includes properly configured file upload requests:

- Use form-data body type
- Select files using the file picker
- Multiple file uploads supported

### Query Parameters

Many endpoints support filtering and pagination:

```
?page=1&limit=10&search=John&searchBy=name&type=doctor
```

### Error Handling

All requests include error response logging for debugging.

## 🌍 Environment Switching

You can easily switch between environments by changing the `environment` variable:

- `local`: Uses localhost:3000 (Gateway) and localhost:3001 (Auth Service)
- `staging`: Uses staging URLs for both services
- `production`: Uses production URLs for both services

The collection automatically updates both `base_url` and `auth_service_url` based on the environment setting.

## 📞 Support

For issues with the API collection:

1. Check environment variable values
2. Verify authentication tokens are valid
3. Review request body format against examples
4. Check server logs for detailed error information

## 🔒 Security Notes

- Tokens are marked as "secret" type in environment
- Never commit real authentication tokens to version control
- Use different tokens for different environments
- Regularly rotate authentication credentials

---

**Happy Testing! 🚀**

This collection provides comprehensive coverage of all HTClinicHub API Gateway and Auth Service endpoints with realistic sample data, automated workflows, and full dual-service architecture support for complete system testing.
