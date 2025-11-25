import React from 'react';
import { MessageCircle } from 'lucide-react';
import { mockDoctors } from '../data';

export default function Search({ darkMode, searchQuery, setSearchQuery, setCurrentPage, setSelectedDoctor, setBookingData }) {
  const filtered = mockDoctors.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.clinic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search doctors, specialties, clinics..." className="flex-1 px-4 py-3 rounded-xl border" />
          <button onClick={() => setCurrentPage('home')} className="px-4 py-3 rounded-xl border">Back</button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(doc => (
            <div key={doc.id} className="p-6 rounded-2xl border bg-white/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{doc.photo}</div>
                <div className="flex-1">
                  <h4 className="font-bold">{doc.name}</h4>
                  <p className="text-sm opacity-70">{doc.specialty} • {doc.experience} yrs</p>
                  <p className="text-sm opacity-70">{doc.clinic}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedDoctor(doc); setBookingData(prev => ({ ...prev, slot: doc.slots[0] })); setCurrentPage('profile'); }} className="flex-1 bg-blue-600 text-white py-2 rounded-xl">Book</button>
                <button className="p-2 border rounded-xl"><MessageCircle size={18} /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="opacity-70">No doctors match your search.</p>}
        </div>
      </div>
    </div>
  );
}