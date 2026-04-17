import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Upload, MapPin, Clock, Calendar, User, Stethoscope, FileText, Building2, DollarSign, Award, AlertCircle } from 'lucide-react';

export default function DoctorOnboarding() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [degreeFile, setDegreeFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleDayToggle = (day) => {
    setFormData({
      ...formData,
      days_open: { ...formData.days_open, [day]: !formData.days_open[day] }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, degree_proof: 'File size must be less than 5MB' });
        return;
      }
      setDegreeFile(file);
      setErrors({ ...errors, degree_proof: '' });
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null); 
      }
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.specialization) newErrors.specialization = 'Specialization is required';
    if (!formData.reg_number.trim()) newErrors.reg_number = 'Registration number is required';
    if (!formData.medical_council.trim()) newErrors.medical_council = 'Medical council is required';
    if (!formData.reg_year) newErrors.reg_year = 'Registration year is required';
    if (!degreeFile) newErrors.degree_proof = 'Medical license/degree is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.clinic_name.trim()) newErrors.clinic_name = 'Clinic name is required';
    if (!formData.address_line.trim()) newErrors.address_line = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.zip_code.trim()) newErrors.zip_code = 'Zip code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.experience_years) newErrors.experience_years = 'Experience is required';
    if (!formData.consultation_fee) newErrors.consultation_fee = 'Consultation fee is required';
    
    const selectedDays = Object.values(formData.days_open).filter(day => day);
    if (selectedDays.length === 0) {
      newErrors.days_open = 'Please select at least one working day';
    }
    
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

  // BACKEND SUBMISSION - THIS WAS THE MISSING PART
  const handleSubmit = async () => {
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
      
      // Append file
      if (degreeFile) {
        submissionData.append('degree_proof', degreeFile);
      }
      
      // Append token
      submissionData.append('token', token);

      // Append form fields
      Object.keys(formData).forEach(key => {
        if (key === 'days_open') {
          submissionData.append(key, JSON.stringify(formData[key]));
        } else {
          submissionData.append(key, formData[key]);
        }
      });

      const response = await axios.post('http://127.0.0.1:5000/doctor-form', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200) {
        alert("✅ Profile Setup Complete! Welcome to WaitFree Clinic.");
        navigate('/doctor-dashboard');
      }

    } catch (error) {
      console.error("Submission Error:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || "Failed to save profile. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    "General Physician",
    "Dentist",
    "Cardiologist",
    "Dermatologist",
    "Pediatrician",
    "Orthopedic",
    "Gynecologist",
    "ENT Specialist",
    "Ophthalmologist",
    "Psychiatrist"
  ];

  const ErrorMessage = ({ error }) => (
    error ? (
      <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
        <AlertCircle className="w-3 h-3" />
        <span>{error}</span>
      </div>
    ) : null
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
          <Stethoscope className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Professional Identity</h3>
          <p className="text-sm text-gray-500">Tell us about your medical credentials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <User className="w-4 h-4" />
            Full Name <span className="text-red-600">*</span>
          </label>
          <input 
            name="full_name" 
            value={formData.full_name} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border ${errors.full_name ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all`}
            placeholder="Dr. Vijay Kumar" 
          />
          <ErrorMessage error={errors.full_name} />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Award className="w-4 h-4" />
            Specialization <span className="text-red-600">*</span>
          </label>
          <select 
            name="specialization" 
            value={formData.specialization} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border ${errors.specialization ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white transition-all appearance-none`}
          >
            <option value="">Select your specialty...</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          <ErrorMessage error={errors.specialization} />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            Registration Number <span className="text-red-600">*</span>
          </label>
          <input 
            name="reg_number" 
            value={formData.reg_number} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border ${errors.reg_number ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all`}
            placeholder="MCI-XXXXX" 
          />
          <ErrorMessage error={errors.reg_number} />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Building2 className="w-4 h-4" />
            Medical Council <span className="text-red-600">*</span>
          </label>
          <input 
            name="medical_council" 
            value={formData.medical_council} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border ${errors.medical_council ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all`}
            placeholder="e.g. Maharashtra Medical Council" 
          />
          <ErrorMessage error={errors.medical_council} />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            Registration Year <span className="text-red-600">*</span>
          </label>
          <input 
            type="number"
            name="reg_year" 
            value={formData.reg_year} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border ${errors.reg_year ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all`}
            placeholder="2015" 
            min="1950"
            max="2026"
          />
          <ErrorMessage error={errors.reg_year} />
        </div>
      </div>

      <div className={`mt-6 p-6 border-2 border-dashed ${errors.degree_proof ? 'border-red-400 bg-red-50' : 'border-teal-300 bg-gradient-to-br from-teal-50 to-green-50'} rounded-2xl`}>
        <label className="flex items-center gap-2 text-sm font-bold text-teal-800 mb-3">
          <Upload className="w-5 h-5" />
          Upload Medical License / Degree Certificate <span className="text-red-600">*</span>
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="cursor-pointer bg-white border-2 border-teal-300 text-teal-700 px-6 py-3 rounded-xl shadow-sm hover:bg-teal-50 hover:shadow-md transition-all font-medium flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Choose File
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
          </label>
          <span className="text-sm text-gray-600 font-medium">
            {degreeFile ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {degreeFile.name}
              </span>
            ) : "No file selected"}
          </span>
        </div>
        {previewUrl && (
          <div className="mt-4 p-3 bg-white rounded-xl border">
            <p className="text-xs text-gray-500 mb-2 font-medium">Preview:</p>
            <img src={previewUrl} alt="Degree Preview" className="h-40 object-contain mx-auto rounded-lg" />
          </div>
        )}
        <p className="text-xs text-gray-500 mt-3">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
        <ErrorMessage error={errors.degree_proof} />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Clinic Information</h3>
          <p className="text-sm text-gray-500">Where patients can find you</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Building2 className="w-4 h-4" />
            Clinic / Hospital Name <span className="text-red-600">*</span>
          </label>
          <input 
            name="clinic_name" 
            value={formData.clinic_name} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border ${errors.clinic_name ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all`}
            placeholder="Sunshine Medical Center" 
          />
          <ErrorMessage error={errors.clinic_name} />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="w-4 h-4" />
            Complete Address <span className="text-red-600">*</span>
          </label>
          <textarea 
            name="address_line" 
            value={formData.address_line} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border ${errors.address_line ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none`}
            placeholder="Shop 4, Ground Floor, Main Road, Near City Hospital..." 
            rows="3" 
          />
          <ErrorMessage error={errors.address_line} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              City <span className="text-red-600">*</span>
            </label>
            <input 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              className={`w-full px-4 py-3 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all`}
              placeholder="Mumbai" 
            />
            <ErrorMessage error={errors.city} />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Zip / Postal Code <span className="text-red-600">*</span>
            </label>
            <input 
              name="zip_code" 
              value={formData.zip_code} 
              onChange={handleChange} 
              className={`w-full px-4 py-3 border ${errors.zip_code ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all`}
              placeholder="400001" 
            />
            <ErrorMessage error={errors.zip_code} />
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Google Maps Link <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <input 
            name="google_maps_link" 
            value={formData.google_maps_link} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
            placeholder="https://maps.google.com/..." 
          />
          <p className="text-xs text-gray-500 mt-2">Help patients navigate to your clinic easily</p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
          <Clock className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Practice Details</h3>
          <p className="text-sm text-gray-500">Set your availability and consultation fee</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Award className="w-4 h-4" />
            Years of Experience <span className="text-red-600">*</span>
          </label>
          <input 
            type="number" 
            name="experience_years" 
            value={formData.experience_years} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border ${errors.experience_years ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all`}
            placeholder="10"
            min="0"
          />
          <ErrorMessage error={errors.experience_years} />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <DollarSign className="w-4 h-4" />
            Consultation Fee (₹) <span className="text-red-600">*</span>
          </label>
          <input 
            type="number" 
            name="consultation_fee" 
            value={formData.consultation_fee} 
            onChange={handleChange} 
            className={`w-full px-4 py-3 border ${errors.consultation_fee ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all`}
            placeholder="500"
            min="0"
          />
          <ErrorMessage error={errors.consultation_fee} />
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-4">
          <Clock className="w-5 h-5 text-indigo-600" />
          Clinic Timings <span className="text-red-600">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
            <span className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
              Morning Session
            </span>
            <div className="flex gap-2 items-center mt-2">
              <input 
                type="time" 
                name="morning_start" 
                value={formData.morning_start} 
                onChange={handleChange} 
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <span className="text-gray-400 font-bold">—</span>
              <input 
                type="time" 
                name="morning_end" 
                value={formData.morning_end} 
                onChange={handleChange} 
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
            <span className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
              Evening Session
            </span>
            <div className="flex gap-2 items-center mt-2">
              <input 
                type="time" 
                name="evening_start" 
                value={formData.evening_start} 
                onChange={handleChange} 
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <span className="text-gray-400 font-bold">—</span>
              <input 
                type="time" 
                name="evening_end" 
                value={formData.evening_end} 
                onChange={handleChange} 
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-4">
          <Calendar className="w-5 h-5 text-teal-600" />
          Working Days <span className="text-red-600">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {Object.keys(formData.days_open).map(day => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              className={`relative w-14 h-14 rounded-2xl text-sm font-bold transition-all transform hover:scale-105 ${
                formData.days_open[day] 
                  ? 'bg-gradient-to-br from-teal-500 to-green-500 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              <span className="block text-xs mb-0.5">{day}</span>
              {formData.days_open[day] && (
                <CheckCircle className="w-3 h-3 absolute top-1 right-1" />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">Select the days your clinic is open for consultations</p>
        <ErrorMessage error={errors.days_open} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen  mt-12 bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100 py-8 px-12">
      <div className="max-w-9xl mx-auto">
        <div className="bg-white w-full rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-teal-600 via-teal-500 to-green-500 p-8 text-white">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Stethoscope className="w-8 h-8" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">WaitFree Clinic</h1>
              <p className="text-teal-50 text-center text-sm md:text-base">Complete Your Professional Profile</p>
            </div>
          </div>

          {/* Progress Indicator */}
        <div className="px-11 pt-8">
  <div className="relative mb-6">

    {/* Full background line */}
    <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-gray-200 rounded-full" />

    {/* Active line */}
    <div
      className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-teal-500 to-green-500 transition-all duration-500"
      style={{ width: `${(step - 1) * 50}%` }}
    />

    {/* Numbers */}
    <div className="grid grid-cols-3 relative z-10">
      {[1, 2, 3].map((num) => (
        <div key={num} className="flex justify-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step >= num
                ? 'bg-gradient-to-br from-teal-500 to-green-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {step > num ? <CheckCircle className="w-5 h-5" /> : num}
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Labels */}
  <div className="grid grid-cols-3 text-xs text-gray-500 font-medium text-center">
    <span>Professional</span>
    <span>Clinic Info</span>
    <span>Availability</span>
  </div>
</div>


          {/* Form Content */}
          <div className="p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
              {step > 1 ? (
                <button 
                  type="button" 
                  onClick={() => {
                    setStep(step - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all font-semibold flex items-center gap-2 shadow-sm hover:shadow"
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
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-green-600 text-white hover:from-teal-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all font-bold flex items-center gap-2"
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
                      Complete Setup
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
