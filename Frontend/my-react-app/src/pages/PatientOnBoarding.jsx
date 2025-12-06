import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PatientOnboarding() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    height: '',
    weight: '',
    
    // Medical History (We will treat these as comma separated strings in UI)
    allergies_input: '',
    chronic_conditions_input: '',
    
    emergency_name: '',
    emergency_phone: '',
    emergency_relation: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard Clause: Prevent submission if not on final step
    if (step < 3) {
        setStep(step + 1);
        return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const submissionData = new FormData();
      
      // Append Token & File
      submissionData.append('token', token);
      if (profileImage) {
        submissionData.append('profile_image', profileImage);
      }

      // Convert comma-separated strings to JSON arrays for Backend
      const allergiesArray = formData.allergies_input.split(',').map(item => item.trim()).filter(i => i);
      const conditionsArray = formData.chronic_conditions_input.split(',').map(item => item.trim()).filter(i => i);

      submissionData.append('allergies', JSON.stringify(allergiesArray));
      submissionData.append('chronic_conditions', JSON.stringify(conditionsArray));

      // Append standard text fields
      const keysToSkip = ['allergies_input', 'chronic_conditions_input'];
      Object.keys(formData).forEach(key => {
        if (!keysToSkip.includes(key)) {
          submissionData.append(key, formData[key]);
        }
      });

      // Send to Backend
      await axios.post('http://127.0.0.1:5000/patient-form', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Profile Setup Complete!");
      navigate('/dashboard'); // Go to Patient Dashboard

    } catch (error) {
      console.error("Error submitting form", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEPS UI ---

  const renderStep1 = () => (
    <div className="space-y-4 animate-fadeIn">
      <h3 className="text-xl font-semibold text-blue-800 border-b pb-2">Personal Information</h3>
      
      {/* Profile Pic Upload */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-2 border-blue-200">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          )}
        </div>
        <label className="cursor-pointer text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded border border-blue-200 hover:bg-blue-100">
           Upload Photo
           <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input name="full_name" value={formData.full_name} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" required />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
           <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Gender</label>
           <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white" required>
             <option value="">Select...</option>
             <option value="Male">Male</option>
             <option value="Female">Female</option>
             <option value="Other">Other</option>
           </select>
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Blood Group</label>
           <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
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
      
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
            <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="175" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="70" />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 animate-fadeIn">
      <h3 className="text-xl font-semibold text-blue-800 border-b pb-2">Medical History</h3>
      <p className="text-sm text-gray-500">This helps doctors understand your background before the visit.</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Allergies</label>
        <textarea 
            name="allergies_input" 
            value={formData.allergies_input} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="e.g. Peanuts, Penicillin, Dust (Separate by comma)" 
            rows="2" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Chronic Conditions</label>
        <textarea 
            name="chronic_conditions_input" 
            value={formData.chronic_conditions_input} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="e.g. Diabetes, Hypertension, Asthma (Separate by comma)" 
            rows="2" 
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 animate-fadeIn">
      <h3 className="text-xl font-semibold text-blue-800 border-b pb-2">Emergency Contact</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Contact Person Name</label>
        <input name="emergency_name" value={formData.emergency_name} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Relationship</label>
        <input name="emergency_relation" value={formData.emergency_relation} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Father, Spouse" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input type="tel" name="emergency_phone" value={formData.emergency_phone} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6 font-inter">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Patient Registration</h1>
          <p className="text-blue-100 text-sm">Step {step} of 3</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1.5">
          <div 
            className="bg-blue-500 h-1.5 transition-all duration-300" 
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
                type="button" 
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition"
              >
                Next Step
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={loading}
                className="px-8 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-lg font-bold transition flex items-center gap-2"
              >
                {loading ? 'Saving...' : 'Finish Profile'}
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}