import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
//import { useAuth } from '../contexts/auth'; 

export default function DoctorOnboarding() {
  const navigate = useNavigate();
  //const { getToken } = useAuth(); 
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [degreeFile, setDegreeFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    specialization: '',
    reg_number: '',
    medical_council: '',
    reg_year: '',
    experience_years: '',
    
    clinic_name: '',
    address_line: '',
    city: '',
    zip_code: '',
    google_maps_link: '',
    
    consultation_fee: '',
    morning_start: '10:00',
    morning_end: '13:00',
    evening_start: '17:00',
    evening_end: '21:00',
    days_open: {
      Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false
    }
  });

  // Handle Text Inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Checkboxes for Days
  const handleDayToggle = (day) => {
    setFormData({
      ...formData,
      days_open: { ...formData.days_open, [day]: !formData.days_open[day] }
    });
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDegreeFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null); 
      }
    }
  };

  // --- LOGIC FIX HERE ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // GUARD CLAUSE: If we are not on the last step, just move to the next step.
    // This prevents accidental submission if user hits "Enter" key on Step 1 or 2.
    if (step < 3) {
        setStep(step + 1);
        return;
    }

    // --- ONLY PROCEED IF STEP IS 3 ---
    setLoading(true);

    try {
      const token = localStorage.getItem('token'); 
      const submissionData = new FormData();
      
      if (degreeFile) {
        submissionData.append('degree_proof', degreeFile);
      }
      
      submissionData.append('token', token);

      Object.keys(formData).forEach(key => {
        if (key === 'days_open') {
          submissionData.append(key, JSON.stringify(formData[key]));
        } else {
          submissionData.append(key, formData[key]);
        }
      });

      await axios.post('http://127.0.0.1:5000/doctor-form', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("Profile Setup Complete!");
      navigate('/doctor-dashboard'); // Or wherever you want to send them

    } catch (error) {
      console.error("Error submitting form", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER STEPS ---
  const renderStep1 = () => (
    <div className="space-y-4 animate-fadeIn">
      <h3 className="text-xl font-semibold text-teal-800 border-b pb-2">Professional Identity</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input name="full_name" value={formData.full_name} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Dr. Vijay Kumar" required />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Registration Number</label>
           <input name="reg_number" value={formData.reg_number} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="MCI-XXXXX" required />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Medical Council</label>
           <input name="medical_council" value={formData.medical_council} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Maharashtra Medical Council" required />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Specialization</label>
           <select name="specialization" value={formData.specialization} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none bg-white" required>
             <option value="">Select...</option>
             <option value="General Physician">General Physician</option>
             <option value="Dentist">Dentist</option>
             <option value="Cardiologist">Cardiologist</option>
             <option value="Dermatologist">Dermatologist</option>
             <option value="Pediatrician">Pediatrician</option>
             <option value="Orthopedic">Orthopedic</option>
           </select>
        </div>
      </div>

      <div className="mt-4 p-4 border-2 border-dashed border-teal-200 rounded-lg bg-teal-50">
        <label className="block text-sm font-medium text-teal-800 mb-2">Upload Degree / Medical License</label>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer bg-white border border-teal-300 text-teal-700 px-4 py-2 rounded shadow-sm hover:bg-teal-50 transition">
             Choose File
             <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
          </label>
          <span className="text-sm text-gray-500">{degreeFile ? degreeFile.name : "No file chosen"}</span>
        </div>
        {previewUrl && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-1">Preview:</p>
            <img src={previewUrl} alt="Degree Preview" className="h-32 object-contain border rounded bg-white" />
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 animate-fadeIn">
      <h3 className="text-xl font-semibold text-teal-800 border-b pb-2">Clinic Details</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">Clinic Name</label>
        <input name="clinic_name" value={formData.clinic_name} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Sunshine Clinic" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Street Address</label>
        <textarea name="address_line" value={formData.address_line} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Shop 4, Main Road..." rows="2" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input name="city" value={formData.city} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Mumbai" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Zip Code</label>
          <input name="zip_code" value={formData.zip_code} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="400001" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Google Maps Link</label>
        <input name="google_maps_link" value={formData.google_maps_link} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="http://googleusercontent.com/maps.google.com/..." />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 animate-fadeIn">
      <h3 className="text-xl font-semibold text-teal-800 border-b pb-2">Logistics & Timing</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
          <input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Consultation Fee (₹)</label>
          <input type="number" name="consultation_fee" value={formData.consultation_fee} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" required />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-bold text-gray-700 mb-2">Clinic Timings</label>
        <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
                <span className="text-xs text-gray-500">Morning Shift</span>
                <div className="flex gap-2">
                    <input type="time" name="morning_start" value={formData.morning_start} onChange={handleChange} className="w-full p-1 border rounded" />
                    <span className="self-center">-</span>
                    <input type="time" name="morning_end" value={formData.morning_end} onChange={handleChange} className="w-full p-1 border rounded" />
                </div>
            </div>
            <div>
                <span className="text-xs text-gray-500">Evening Shift</span>
                <div className="flex gap-2">
                    <input type="time" name="evening_start" value={formData.evening_start} onChange={handleChange} className="w-full p-1 border rounded" />
                    <span className="self-center">-</span>
                    <input type="time" name="evening_end" value={formData.evening_end} onChange={handleChange} className="w-full p-1 border rounded" />
                </div>
            </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Days Open</label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(formData.days_open).map(day => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${
                formData.days_open[day] 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              {day.charAt(0)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-6 font-inter">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-teal-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-teal-100 text-sm">Step {step} of 3</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1.5">
          <div 
            className="bg-teal-500 h-1.5 transition-all duration-300" 
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8">
          
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
              >
                Back
              </button>
            ) : (
                <div></div>
            )}

            {step < 3 ? (
              <button 
                type="button" // Important: Keep this as button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-md transition"
              >
                Next Step
              </button>
            ) : (
              <button 
                type="submit" // Only the last button is submit
                disabled={loading}
                className="px-8 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-lg font-bold transition flex items-center gap-2"
              >
                {loading ? 'Saving...' : 'Finish Setup'}
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}