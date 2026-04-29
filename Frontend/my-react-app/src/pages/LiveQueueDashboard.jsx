import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  UserPlus, 
  SkipForward, 
  Phone, 
  AlertCircle,
  Activity,
  Timer,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

// Mock API service
const api = {
  getQueue: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, token: 'A001', name: 'John Doe', age: 45, symptoms: 'Chest pain, shortness of breath', arrivalTime: '09:15', status: 'Waiting', riskLevel: 'High', waitTime: 25 },
          { id: 2, token: 'A002', name: 'Sarah Smith', age: 32, symptoms: 'Severe headache, dizziness', arrivalTime: '09:30', status: 'Waiting', riskLevel: 'Medium', waitTime: 15 },
          { id: 3, token: 'A003', name: 'Mike Johnson', age: 58, symptoms: 'Fever, cough, body ache', arrivalTime: '09:45', status: 'Waiting', riskLevel: 'Medium', waitTime: 10 },
          { id: 4, token: 'A004', name: 'Emily Brown', age: 28, symptoms: 'Abdominal pain, nausea', arrivalTime: '10:00', status: 'Waiting', riskLevel: 'Low', waitTime: 5 },
          { id: 5, token: 'A005', name: 'David Wilson', age: 67, symptoms: 'Joint pain, fatigue', arrivalTime: '10:15', status: 'Waiting', riskLevel: 'Low', waitTime: 0 },
        ]);
      }, 500);
    });
  },
  callNext: () => Promise.resolve(),
  markDone: () => Promise.resolve(),
  addPatient: (patient) => Promise.resolve(patient),
  skipPatient: () => Promise.resolve(),
};

const LiveQueueDashboard =({ darkMode }) => {
  const [queue, setQueue] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [nextPatients, setNextPatients] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyPatient, setEmergencyPatient] = useState({
    name: '',
    age: '',
    symptoms: '',
    riskLevel: 'High'
  });
  const [notification, setNotification] = useState(null);
  const audioRef = useRef(null);

  // Load queue data on mount
  useEffect(() => {
    loadQueue();
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Check for new patients (simulated)
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const data = await api.getQueue();
      setQueue(data);
      if (data.length > 0) {
        setCurrentPatient(data[0]);
        setNextPatients(data.slice(1, 4));
      }
      setCompletedCount(Math.floor(Math.random() * 50) + 20); // Mock completed patients
      playNotification();
    } catch (error) {
      console.error('Error loading queue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleCallNext = async () => {
    if (currentPatient) {
      // Move current to in-progress temporarily
      const updatedQueue = queue.map(p => 
        p.id === currentPatient.id ? { ...p, status: 'In Progress' } : p
      );
      setQueue(updatedQueue);
      setCurrentPatient({ ...currentPatient, status: 'In Progress' });
      
      // Simulate API call
      await api.callNext();
      
      // Move to next patient
      if (nextPatients.length > 0) {
        const nextPatient = nextPatients[0];
        setCurrentPatient(nextPatient);
        setNextPatients(nextPatients.slice(1));
        
        // Update queue
        const newQueue = updatedQueue.map(p => 
          p.id === nextPatient.id ? { ...p, status: 'In Progress' } : p
        );
        setQueue(newQueue);
      } else {
        setCurrentPatient(null);
        setNextPatients([]);
      }
    }
  };

  const handleMarkDone = async () => {
    if (currentPatient) {
      await api.markDone();
      setCompletedCount(prev => prev + 1);
      
      // Remove current patient from queue
      const updatedQueue = queue.filter(p => p.id !== currentPatient.id);
      setQueue(updatedQueue);
      
      // Auto call next
      if (nextPatients.length > 0) {
        const nextPatient = nextPatients[0];
        setCurrentPatient(nextPatient);
        setNextPatients(nextPatients.slice(1));
      } else {
        setCurrentPatient(null);
        setNextPatients([]);
      }
    }
  };

  const handleSkipPatient = async () => {
    if (currentPatient) {
      // Move current patient to the end of queue
      const updatedQueue = queue.filter(p => p.id !== currentPatient.id);
      const skippedPatient = { ...currentPatient, status: 'Waiting', waitTime: 0 };
      const newQueue = [...updatedQueue, skippedPatient];
      setQueue(newQueue);
      
      // Set next patient as current
      if (nextPatients.length > 0) {
        const nextPatient = nextPatients[0];
        setCurrentPatient(nextPatient);
        setNextPatients([...nextPatients.slice(1), skippedPatient]);
      } else {
        setCurrentPatient(skippedPatient);
        setNextPatients([]);
      }
      
      await api.skipPatient();
    }
  };

  const handleEmergencyAdd = async () => {
    const newPatient = {
      id: Date.now(),
      token: `E${String(Date.now()).slice(-4)}`,
      name: emergencyPatient.name,
      age: parseInt(emergencyPatient.age),
      symptoms: emergencyPatient.symptoms,
      arrivalTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Waiting',
      riskLevel: emergencyPatient.riskLevel,
      waitTime: 0
    };
    
    // Add to front of queue
    const updatedQueue = [newPatient, ...queue];
    setQueue(updatedQueue);
    setCurrentPatient(newPatient);
    setNextPatients(updatedQueue.slice(1, 4));
    
    await api.addPatient(newPatient);
    setShowEmergencyModal(false);
    playNotification();
    setEmergencyPatient({ name: '', age: '', symptoms: '', riskLevel: 'High' });
    
    // Show notification
    setNotification({
      message: `Emergency patient ${newPatient.name} added to queue`,
      type: 'emergency'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const calculateWaitTime = (patient) => {
    if (patient.status === 'In Progress') return 0;
    const position = queue.findIndex(p => p.id === patient.id);
    return position * 5; // Estimated 5 min per patient
  };

  return (
<div className={`min-h-screen mt-9 p-4 md:p-6 ${
  darkMode 
    ? 'bg-gray-900 text-white' 
    : 'bg-gradient-to-br from-blue-50 to-green-50 text-gray-900'
}`}>      {/* Notification Sound */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVwAAACAgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICAf39/gH9/f4B/f3+AgICI=" />
      
      {/* Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
          <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg ${
            notification.type === 'emergency' 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            <AlertCircle className="w-5 h-5" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-6">
       
          <div className="flex items-center mt-8 gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              ● Live
            </span>
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
       
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-800  transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Current Queue #</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {currentPatient ? currentPatient.token : '—'}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 dark:bg-gray-800  transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Waiting Patients</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {queue.filter(p => p.status === 'Waiting').length}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <Clock className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-800  transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Completed Today</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{completedCount}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Patient Section */}
        <div className="lg:col-span-2">
          {currentPatient ? (
            <div className="bg-white dark:text-white dark:border-white dark:bg-gray-800  rounded-xl shadow-lg p-6 mb-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center  gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Current Patient</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentPatient.riskLevel === 'High' 
                    ? 'bg-red-100 text-red-700'
                    : currentPatient.riskLevel === 'Medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {currentPatient.riskLevel} Risk
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Patient Name</p>
                    <p className="text-lg font-semibold dark:text-gray-700 text-gray-800">{currentPatient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Age</p>
                    <p className="text-lg font-semibold dark:text-gray-700 text-gray-800">{currentPatient.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Token Number</p>
                    <p className="text-lg font-semibold dark:text-gray-700 text-blue-600">{currentPatient.token}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Symptoms</p>
                    <p className="text-gray-700">{currentPatient.symptoms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Waiting Time</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-700 flex items-center gap-2">
                      <Timer className="w-4 h-4 dark:text-gray-700 text-gray-500" />
                      {currentPatient.waitTime} min
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Estimated Wait</p>
                    <p className="text-lg font-semibold dark:text-gray-700 text-gray-800">
                      ~{calculateWaitTime(currentPatient)} min
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={handleCallNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <Phone className="w-4 h-4" />
                  Call Next
                </button>
                <button
                  onClick={handleMarkDone}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Done
                </button>
                <button
                  onClick={handleSkipPatient}
                  className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip Patient
                </button>
                <button
                  onClick={() => setShowEmergencyModal(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <AlertCircle className="w-4 h-4" />
                  Emergency Add
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-6">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-600">No Patients in Queue</h3>
              <p className="text-gray-400">Waiting for new patients to arrive</p>
            </div>
          )}

          {/* Next Patients Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold dark:text-gray-700 text-gray-800 mb-4 flex items-center gap-2">
              <ChevronRight className="w-5 h-5  dark:text-gray-700  text-blue-500" />
              Next in Queue
            </h3>
            {nextPatients.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2  dark:text-gray-700  lg:grid-cols-3 gap-3">
                {nextPatients.map((patient, index) => (
                  <div key={patient.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold  dark:text-gray-700  text-gray-800">{patient.name}</p>
                        <p className="text-sm text-gray-500">Token: {patient.token}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        patient.riskLevel === 'High' 
                          ? 'bg-red-100 text-red-700'
                          : patient.riskLevel === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {patient.riskLevel}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Est. wait: ~{(index + 1) * 5} min</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No upcoming patients</p>
            )}
          </div>
        </div>

        {/* Queue List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl dark:bg-gray-800  shadow-lg p-6 h-[600px] flex flex-col">
            <h3 className="text-lg font-semibold dark:text-gray-700 text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 dark:text-white-50 text-blue-500" />
              Queue List
              <span className="text-sm font-normal text-gray-400 ml-auto">
                {queue.length} patients
              </span>
            </h3>
            
            <div className="flex-1 overflow-y-auto dark:text-gray-700 space-y-2 pr-2">
              {queue.length > 0 ? (
                queue.map((patient) => (
                  <div key={patient.id} className={`p-3 rounded-lg border transition-all ${patient.id === currentPatient?.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center  dark:text-gray-700 gap-2">
                          <span className="font-semibold  dark:text-gray-700  text-gray-800">{patient.token}</span>
                          <span className="text-sm text-gray-600">{patient.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Arrived: {patient.arrivalTime}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        patient.status === 'In Progress' 
                          ? 'bg-green-100 text-green-700'
                          : patient.status === 'Done' 
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {patient.status}
                      </span>
                    </div>
                    {patient.id === currentPatient?.id && (
                      <div className="mt-1 text-xs text-blue-600 font-medium">
                        ● Currently serving
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 dark:text-white-50 text-gray-400">
                  <Users className="w-8 h-8 dark:text-white-50 mx-auto mb-2 opacity-50" />
                  <p>Queue is empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Emergency Patient</h3>
              <button 
                onClick={() => setShowEmergencyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={emergencyPatient.name}
                  onChange={(e) => setEmergencyPatient({...emergencyPatient, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter patient name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={emergencyPatient.age}
                  onChange={(e) => setEmergencyPatient({...emergencyPatient, age: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter age"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                <textarea
                  value={emergencyPatient.symptoms}
                  onChange={(e) => setEmergencyPatient({...emergencyPatient, symptoms: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  placeholder="Describe symptoms"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                <select
                  value={emergencyPatient.riskLevel}
                  onChange={(e) => setEmergencyPatient({...emergencyPatient, riskLevel: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              
              <button
                onClick={handleEmergencyAdd}
                className="w-full px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                disabled={!emergencyPatient.name || !emergencyPatient.age || !emergencyPatient.symptoms}
              >
                Add to Front of Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveQueueDashboard;