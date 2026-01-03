import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Heart, Phone, Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function PatientOnboarding({ darkMode = false }) {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    height: '',
    weight: '',
    
    allergies_input: '',
    chronic_conditions_input: '',
    
    emergency_name: '',
    emergency_phone: '',
    emergency_relation: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, profile_image: 'File size must be less than 5MB' });
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors({ ...errors, profile_image: '' });
    }
  };

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    // Medical history is optional, so always valid
    return true;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.emergency_name.trim()) newErrors.emergency_name = 'Emergency contact name is required';
    if (!formData.emergency_phone.trim()) newErrors.emergency_phone = 'Emergency phone is required';
    if (!formData.emergency_relation.trim()) newErrors.emergency_relation = 'Relationship is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    }
    
    if (isValid && step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // BACKEND SUBMISSION
  const handleSubmit = async () => {
    if (step < 3) {
      handleNext();
      return;
    }

    if (!validateStep3()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Session expired. Please login again.");
        navigate('/login');
        return;
      }

      const submissionData = new FormData();

      // Append profile image if exists
      if (profileImage) {
        submissionData.append('profile_image', profileImage);
      }

      // Append token
      submissionData.append('token', token);

      // Append all form fields
      Object.keys(formData).forEach(key => {
        submissionData.append(key, formData[key]);
      });

      const response = await axios.post('http://127.0.0.1:5000/patient-form', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200) {
        alert("✅ Profile Setup Complete! Welcome to WaitFree Clinic.");
        navigate('/patient-dashboard');
      }

    } catch (error) {
      console.error("Submission Error:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || "Failed to save profile. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const ErrorMessage = ({ error }) => (
    error ? (
      <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
        <AlertCircle className="w-3 h-3" />
        <span>{error}</span>
      </div>
    ) : null
  );

  // --- STEPS UI ---

  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
        }`}>
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Personal Information
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Tell us about yourself
          </p>
        </div>
      </div>
      
      {/* Profile Pic Upload */}
      <div className={`flex items-center gap-6 p-6 rounded-2xl border-2 border-dashed ${
        darkMode 
          ? 'border-blue-700 bg-gradient-to-br from-blue-900/30 to-indigo-900/30' 
          : 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50'
      }`}>
        <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
          darkMode ? 'border-blue-700 bg-gray-800' : 'border-blue-200 bg-gray-200'
        }`}>
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${
              darkMode ? 'text-gray-600' : 'text-gray-400'
            }`}>
              <User className="w-10 h-10" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className={`cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all font-medium shadow-sm hover:shadow-md ${
            darkMode 
              ? 'bg-gray-800 border-blue-600 text-blue-400 hover:bg-gray-700' 
              : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
          }`}>
            <Upload className="w-4 h-4" />
            Upload Photo
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {profileImage ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                {profileImage.name}
              </span>
            ) : "Supported formats: JPG, PNG (Max 5MB)"}
          </p>
          <ErrorMessage error={errors.profile_image} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Full Name <span className="text-red-600">*</span>
          </label>
          <input 
            name="full_name" 
            value={formData.full_name} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
              darkMode 
                ? 'border-gray-600 bg-gray-800 text-white' 
                : errors.full_name ? 'border-red-500' : 'border-gray-300 bg-white'
            }`}
            placeholder="John Doe" 
          />
          <ErrorMessage error={errors.full_name} />
        </div>
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Date of Birth <span className="text-red-600">*</span>
          </label>
          <input 
            type="date" 
            name="date_of_birth" 
            value={formData.date_of_birth} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
              darkMode 
                ? 'border-gray-600 bg-gray-800 text-white' 
                : errors.date_of_birth ? 'border-red-500' : 'border-gray-300 bg-white'
            }`}
          />
          <ErrorMessage error={errors.date_of_birth} />
        </div>
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Gender <span className="text-red-600">*</span>
          </label>
          <select 
            name="gender" 
            value={formData.gender} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none ${
              darkMode 
                ? 'border-gray-600 bg-gray-800 text-white' 
                : errors.gender ? 'border-red-500' : 'border-gray-300 bg-white'
            }`}
          >
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <ErrorMessage error={errors.gender} />
        </div>
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Blood Group
          </label>
          <select 
            name="blood_group" 
            value={formData.blood_group} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none ${
              darkMode 
                ? 'border-gray-600 bg-gray-800 text-white' 
                : 'border-gray-300 bg-white'
            }`}
          >
            <option value="">Select...</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Height (cm)
          </label>
          <input 
            type="number" 
            name="height" 
            value={formData.height} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
              darkMode 
                ? 'border-gray-600 bg-gray-800 text-white' 
                : 'border-gray-300 bg-white'
            }`}
            placeholder="175" 
          />
        </div>
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Weight (kg)
          </label>
          <input 
            type="number" 
            name="weight" 
            value={formData.weight} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
              darkMode 
                ? 'border-gray-600 bg-gray-800 text-white' 
                : 'border-gray-300 bg-white'
            }`}
            placeholder="70" 
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600'
        }`}>
          <Heart className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Medical History
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            This helps doctors understand your background
          </p>
        </div>
      </div>
      
      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Allergies
        </label>
        <textarea 
          name="allergies_input" 
          value={formData.allergies_input} 
          onChange={handleChange} 
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${
            darkMode 
              ? 'border-gray-600 bg-gray-800 text-white' 
              : 'border-gray-300 bg-white'
          }`}
          placeholder="e.g. Peanuts, Penicillin, Dust (Separate by comma)" 
          rows="3" 
        />
        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          List any known allergies, separated by commas
        </p>
      </div>

      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Chronic Conditions
        </label>
        <textarea 
          name="chronic_conditions_input" 
          value={formData.chronic_conditions_input} 
          onChange={handleChange} 
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${
            darkMode 
              ? 'border-gray-600 bg-gray-800 text-white' 
              : 'border-gray-300 bg-white'
          }`}
          placeholder="e.g. Diabetes, Hypertension, Asthma (Separate by comma)" 
          rows="3" 
        />
        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          List any chronic health conditions, separated by commas
        </p>
      </div>

      <div className={`p-5 rounded-xl border ${
        darkMode 
          ? 'bg-yellow-900/20 border-yellow-700' 
          : 'bg-yellow-50 border-yellow-300'
      }`}>
        <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
          <strong>Note:</strong> This information is confidential and will only be shared with your healthcare providers.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'
        }`}>
          <Phone className="w-6 h-6" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Emergency Contact
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Someone we can reach in case of emergency
          </p>
        </div>
      </div>
      
      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Contact Person Name <span className="text-red-600">*</span>
        </label>
        <input 
          name="emergency_name" 
          value={formData.emergency_name} 
          onChange={handleChange} 
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
            darkMode 
              ? 'border-gray-600 bg-gray-800 text-white' 
              : errors.emergency_name ? 'border-red-500' : 'border-gray-300 bg-white'
          }`}
          placeholder="Jane Doe"
        />
        <ErrorMessage error={errors.emergency_name} />
      </div>

      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Relationship <span className="text-red-600">*</span>
        </label>
        <input 
          name="emergency_relation" 
          value={formData.emergency_relation} 
          onChange={handleChange} 
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
            darkMode 
              ? 'border-gray-600 bg-gray-800 text-white' 
              : errors.emergency_relation ? 'border-red-500' : 'border-gray-300 bg-white'
          }`}
          placeholder="e.g. Mother, Spouse, Sibling" 
        />
        <ErrorMessage error={errors.emergency_relation} />
      </div>

      <div>
        <label className={`block text-sm font-semibold mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Phone Number <span className="text-red-600">*</span>
        </label>
        <input 
          type="tel" 
          name="emergency_phone" 
          value={formData.emergency_phone} 
          onChange={handleChange} 
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
            darkMode 
              ? 'border-gray-600 bg-gray-800 text-white' 
              : errors.emergency_phone ? 'border-red-500' : 'border-gray-300 bg-white'
          }`}
          placeholder="+91 98765 43210"
        />
        <ErrorMessage error={errors.emergency_phone} />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen mt-20 py-8 px-4 transition-colors ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100'
    }`}>

      <div className="max-w-8xl mx-auto">

      <div className="w-full mx-auto">
        <div className={`rounded-3xl shadow-2xl overflow-hidden ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          
          {/* Header */}
          <div className="relative  bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <User className="w-8 h-8" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Patient Registration</h1>
              <p className="text-blue-100 text-center text-sm md:text-base">Step {step} of 3</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="px-8 pt-8">
            <div className="relative flex items-center mb-6">
              <div
                className={`absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              />
              <div
                className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                style={{ width: `${(step - 1) * 50}%` }}
              />
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`relative z-10 ${
                    num === 1
                      ? ''
                      : num === 2
                      ? 'absolute left-[46%] -translate-x-1/2'
                      : 'ml-auto'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step >= num
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                        : darkMode
                          ? 'bg-gray-700 text-gray-500'
                          : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step > num ? <CheckCircle className="w-5 h-5" /> : num}
                  </div>
                </div>
              ))}
            </div>
            <div
              className={`flex justify-between text-xs font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <span>Personal</span>
              <span>Medical</span>
              <span>Emergency</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className={`flex justify-between items-center mt-10 pt-6 border-t ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              {step > 1 ? (
                <button 
                  type="button" 
                  onClick={() => {
                    setStep(step - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-6 py-3 rounded-xl border-2 transition-all font-semibold flex items-center gap-2 shadow-sm hover:shadow ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>←</span> Back
                </button>
              ) : (
                <div></div>
              )}

              {step < 3 ? (
                <button 
                  type="button" 
                  onClick={handleNext}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all font-bold flex items-center gap-2"
                >
                  Next Step <span>→</span>
                </button>
              ) : (
                <button 
                  type="button" 
                  disabled={loading}
                  onClick={handleSubmit}
                  className="px-10 py-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Finish Profile
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
     {/* Footer */}
      <footer className="py-16 px-6 bg-gray-900 text-white">
<div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12"> {/* Better alignment with 5 columns */}
         <div className="col-span-2">
               <div className="flex items-center gap-2 mb-4">
                                <img
                src="/Logo.png"
                alt="WaitFree Clinic"
                className="h-10 w-auto mr-2"  // space between image and text
              />
              
                <span className="text-2xl font-extrabold">WaitFree<span className="text-blue-400">Clinic</span></span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs">
                Making modern healthcare accessible and convenient by putting time back in your day.
              </p>
            </div>
            <div>
              <h4 className="font-extrabold mb-4 text-blue-400 border-b border-blue-400/30 pb-1">For Patients</h4>
              <ul className="space-y-3">
                <li><a href="/Search" className="text-gray-400 hover:text-white transition-colors">Find Doctors</a></li>
                <li>
                  <a href='/patient-login' className="text-gray-400 hover:text-white transition-colors">Book Appointment</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Video Consultation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold mb-4 text-blue-400 border-b border-blue-400/30 pb-1">For Doctors</h4>
              <ul className="space-y-3">
                <li><a href="/Login" className="text-gray-400 hover:text-white transition-colors">Doctor Login</a></li>
                <li><a href="/Login" className="text-gray-400 hover:text-white transition-colors">Register Clinic</a></li>
                <li><a href="/Pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold mb-4 text-blue-400 border-b border-blue-400/30 pb-1">Company</h4>
              <ul className="space-y-3">
                <li><a href="/About-us" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="Contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="/Privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            <p>© 2026 WaitFree-Clinic. All rights reserved. | Built with 💙 for modern healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
