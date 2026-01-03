import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff,
  MessageSquare, FileText, Camera, Users, Clock,
  Settings, Volume2, VolumeX, Maximize, Share2,
  Send, Paperclip, Download, Upload, CheckCircle,
  AlertCircle, Moon, Sun, Grid, User, Stethoscope,
  Heart, Activity, Thermometer, Clipboard, X, Plus
} from 'lucide-react';

const VideoConsultation = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [userType, setUserType] = useState('patient'); // 'patient' or 'doctor'
  const [callStatus, setCallStatus] = useState('waiting'); // 'waiting', 'connecting', 'connected', 'ended'
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  
  const [chatMessages, setChatMessages] = useState([
    { sender: 'system', message: 'Consultation room is ready. Waiting for both parties to join...', time: '10:00 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ name: '', dosage: '', duration: '' });
  
  const [vitals, setVitals] = useState({
    heartRate: '72',
    bloodPressure: '120/80',
    temperature: '98.6',
    oxygenLevel: '98'
  });

  const [consultationInfo, setConsultationInfo] = useState({
    patientName: 'Rajesh Kumar',
    doctorName: 'Dr. Priya Sharma',
    specialization: 'General Medicine',
    appointmentTime: '10:30 AM',
    duration: '00:00',
    consultationId: 'WFC-2025-001234'
  });

  const [connectionQuality, setConnectionQuality] = useState('excellent'); // excellent, good, poor
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Simulate video stream
  useEffect(() => {
    if (callStatus === 'connected' && videoRef.current && isVideoOn) {
      // In real implementation, this would use WebRTC getUserMedia
      videoRef.current.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }, [callStatus, isVideoOn]);

  // Simulate duration timer
  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => {
        setConsultationInfo(prev => {
          const [minutes, seconds] = prev.duration.split(':').map(Number);
          const newSeconds = seconds + 1;
          const newMinutes = minutes + Math.floor(newSeconds / 60);
          return {
            ...prev,
            duration: `${String(newMinutes).padStart(2, '0')}:${String(newSeconds % 60).padStart(2, '0')}`
          };
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const startCall = () => {
    setCallStatus('connecting');
    setTimeout(() => {
      setCallStatus('connected');
      setChatMessages(prev => [...prev, {
        sender: 'system',
        message: `${userType === 'doctor' ? consultationInfo.patientName : consultationInfo.doctorName} has joined the consultation`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  const endCall = () => {
    setCallStatus('ended');
    setChatMessages(prev => [...prev, {
      sender: 'system',
      message: 'Consultation ended. Thank you!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages(prev => [...prev, {
        sender: userType,
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  };

  const addMedicine = () => {
    if (newMedicine.name && newMedicine.dosage && newMedicine.duration) {
      setPrescription(prev => [...prev, { ...newMedicine, id: Date.now() }]);
      setNewMedicine({ name: '', dosage: '', duration: '' });
    }
  };

  const removeMedicine = (id) => {
    setPrescription(prev => prev.filter(med => med.id !== id));
  };

  const bg = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  // Waiting Room UI
  if (callStatus === 'waiting') {
    return (
      <div className={`min-h-screen ${bg} transition-colors duration-500 flex items-center justify-center p-6`}>
        <div className={`max-w-2xl w-full ${cardBg} rounded-3xl shadow-2xl border-2 ${borderColor} p-8`}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
              WaitFree Video Consultation
            </h1>
            <p className={textSecondary}>
              Secure & HIPAA Compliant Virtual Healthcare
            </p>
          </div>

          <div className={`bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-6 mb-6`}>
            <h2 className={`text-xl font-bold ${textPrimary} mb-4`}>Consultation Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className={`text-sm ${textSecondary} mb-1`}>Patient</p>
                <p className={`font-semibold ${textPrimary}`}>{consultationInfo.patientName}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary} mb-1`}>Doctor</p>
                <p className={`font-semibold ${textPrimary}`}>{consultationInfo.doctorName}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary} mb-1`}>Specialization</p>
                <p className={`font-semibold ${textPrimary}`}>{consultationInfo.specialization}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondary} mb-1`}>Scheduled Time</p>
                <p className={`font-semibold ${textPrimary}`}>{consultationInfo.appointmentTime}</p>
              </div>
            </div>
            <div className={`bg-white dark:bg-gray-700 rounded-lg p-3`}>
              <p className={`text-xs ${textSecondary} mb-1`}>Consultation ID</p>
              <p className={`font-mono text-sm ${textPrimary}`}>{consultationInfo.consultationId}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-semibold ${textPrimary} mb-3`}>
              Join as:
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'patient', label: 'Patient', icon: User },
                { value: 'doctor', label: 'Doctor', icon: Stethoscope }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setUserType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : `border-gray-200 dark:border-gray-700`
                  }`}
                >
                  <type.icon className={`w-8 h-8 mx-auto mb-2 ${
                    userType === type.value ? 'text-blue-600' : textSecondary
                  }`} />
                  <span className={`font-semibold ${
                    userType === type.value ? 'text-blue-600' : textPrimary
                  }`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center gap-3">
                <Video className={`w-5 h-5 ${isVideoOn ? 'text-green-600' : 'text-red-600'}`} />
                <span className={textPrimary}>Camera</span>
              </div>
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  isVideoOn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isVideoOn ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center gap-3">
                <Mic className={`w-5 h-5 ${isAudioOn ? 'text-green-600' : 'text-red-600'}`} />
                <span className={textPrimary}>Microphone</span>
              </div>
              <button
                onClick={() => setIsAudioOn(!isAudioOn)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  isAudioOn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isAudioOn ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <button
            onClick={startCall}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Video className="w-5 h-5" />
            Join Consultation Room
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`mt-4 w-full ${cardBg} border ${borderColor} py-3 rounded-xl hover:shadow-md transition-all flex items-center justify-center gap-2`}
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            <span className={textPrimary}>{darkMode ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </div>
    );
  }

  // Connecting UI
  if (callStatus === 'connecting') {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Video className="w-12 h-12 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>Connecting...</h2>
          <p className={textSecondary}>Setting up secure video connection</p>
        </div>
      </div>
    );
  }

  // Ended UI
  if (callStatus === 'ended') {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center p-6`}>
        <div className={`max-w-2xl w-full ${cardBg} rounded-3xl shadow-2xl border-2 ${borderColor} p-8 text-center`}>
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
            Consultation Completed
          </h1>
          <p className={`${textSecondary} mb-6`}>
            Duration: {consultationInfo.duration}
          </p>

          <div className={`bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-6 mb-6 text-left`}>
            <h3 className={`font-bold ${textPrimary} mb-4`}>Consultation Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={textSecondary}>Patient:</span>
                <span className={textPrimary}>{consultationInfo.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Doctor:</span>
                <span className={textPrimary}>{consultationInfo.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Duration:</span>
                <span className={textPrimary}>{consultationInfo.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>ID:</span>
                <span className={`font-mono text-sm ${textPrimary}`}>{consultationInfo.consultationId}</span>
              </div>
            </div>
          </div>

          {userType === 'doctor' && prescription.length > 0 && (
            <div className={`bg-purple-50 dark:bg-purple-900/30 rounded-2xl p-6 mb-6 text-left`}>
              <h3 className={`font-bold ${textPrimary} mb-4`}>Prescription Sent</h3>
              <div className="space-y-2">
                {prescription.map((med, idx) => (
                  <div key={idx} className={`p-3 bg-white dark:bg-gray-700 rounded-lg`}>
                    <p className={`font-semibold ${textPrimary}`}>{med.name}</p>
                    <p className={`text-sm ${textSecondary}`}>{med.dosage} - {med.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button className={`${cardBg} border-2 ${borderColor} py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 ${textPrimary}`}>
              <Download className="w-5 h-5" />
              Download Report
            </button>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              Book Follow-up
            </button>
          </div>

          <button
            onClick={() => setCallStatus('waiting')}
            className={`mt-4 w-full ${cardBg} border ${borderColor} py-3 rounded-xl hover:shadow-md transition-all ${textPrimary}`}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Main Video Call UI
  return (
    <div className={`min-h-screen ${bg} transition-colors duration-500`}>
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`font-bold ${textPrimary}`}>
                  {userType === 'patient' ? consultationInfo.doctorName : consultationInfo.patientName}
                </h2>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${connectionQuality === 'excellent' ? 'bg-green-500' : connectionQuality === 'good' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                  <span className={`text-xs ${textSecondary}`}>
                    {connectionQuality === 'excellent' ? 'Excellent' : connectionQuality === 'good' ? 'Good' : 'Poor'} Connection
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg`}>
              <Clock className="w-4 h-4 text-red-600" />
              <span className="font-mono font-semibold text-red-600">{consultationInfo.duration}</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${cardBg} border ${borderColor} hover:shadow-md transition-all`}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Remote Video */}
            <div className={`relative ${cardBg} rounded-2xl overflow-hidden shadow-2xl border-2 ${borderColor}`} style={{ height: '500px' }}>
              <div 
                ref={remoteVideoRef}
                className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    {userType === 'patient' ? (
                      <Stethoscope className="w-16 h-16 text-white" />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {userType === 'patient' ? consultationInfo.doctorName : consultationInfo.patientName}
                  </h3>
                  <p className="text-blue-100">
                    {userType === 'patient' ? consultationInfo.specialization : 'Patient'}
                  </p>
                </div>
              </div>

              {/* Local Video PIP */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl overflow-hidden shadow-lg border-2 border-white">
                {isVideoOn ? (
                  <div ref={videoRef} className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <VideoOff className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Connection Quality Indicator */}
              <div className="absolute top-4 left-4">
                <div className={`px-3 py-2 rounded-lg backdrop-blur-md ${
                  connectionQuality === 'excellent' ? 'bg-green-500/80' : 
                  connectionQuality === 'good' ? 'bg-yellow-500/80' : 'bg-red-500/80'
                }`}>
                  <span className="text-white text-sm font-semibold">
                    {connectionQuality === 'excellent' ? '⚡ Excellent' : 
                     connectionQuality === 'good' ? '📶 Good' : '⚠️ Poor'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className={`${cardBg} rounded-2xl p-4 shadow-lg border ${borderColor}`}>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-4 rounded-xl transition-all ${
                    isVideoOn 
                      ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>

                <button
                  onClick={() => setIsAudioOn(!isAudioOn)}
                  className={`p-4 rounded-xl transition-all ${
                    isAudioOn 
                      ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>

                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`p-4 rounded-xl transition-all ${
                    isSpeakerOn 
                      ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
                >
                  {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>

                <button
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`p-4 rounded-xl transition-all ${
                    isScreenSharing 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                  }`}
                  title="Share screen"
                >
                  <Share2 className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`p-4 rounded-xl transition-all ${
                    showChat 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                  }`}
                  title="Chat"
                >
                  <MessageSquare className="w-6 h-6" />
                </button>

                <button
                  onClick={endCall}
                  className="p-4 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all"
                  title="End call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Tab Selector */}
            <div className={`${cardBg} rounded-2xl p-2 shadow-lg border ${borderColor} grid grid-cols-3 gap-2`}>
              <button
                onClick={() => { setShowChat(true); setShowNotes(false); setShowVitals(false); }}
                className={`py-2 px-3 rounded-lg transition-all ${showChat ? 'bg-blue-500 text-white' : textSecondary}`}
              >
                <MessageSquare className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Chat</span>
              </button>
              {userType === 'doctor' && (
                <button
                  onClick={() => { setShowChat(false); setShowNotes(true); setShowVitals(false); }}
                  className={`py-2 px-3 rounded-lg transition-all ${showNotes ? 'bg-blue-500 text-white' : textSecondary}`}
                >
                  <FileText className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">Notes</span>
                </button>
              )}
              <button
                onClick={() => { setShowChat(false); setShowNotes(false); setShowVitals(true); }}
                className={`py-2 px-3 rounded-lg transition-all ${showVitals ? 'bg-blue-500 text-white' : textSecondary}`}
              >
                <Activity className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Vitals</span>
              </button>
            </div>

            {/* Chat Panel */}
            {showChat && (
              <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} overflow-hidden`} style={{ height: '520px' }}>
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                      <MessageSquare className="w-5 h-5" />
                      Chat
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`${
                        msg.sender === 'system' ? 'text-center' : 
                        msg.sender === userType ? 'text-right' : 'text-left'
                      }`}>
                        {msg.sender === 'system' ? (
                          <p className="text-xs text-gray-500 italic">{msg.message}</p>
                        ) : (
                          <div className={`inline-block max-w-xs ${
                            msg.sender === userType 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                          } rounded-lg px-4 py-2`}>
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${
                              msg.sender === userType ? 'text-blue-100' : 'text-gray-500'
                            }`}>{msg.time}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${textPrimary} bg-gray-50 dark:bg-gray-700 focus:outline-none focus:border-blue-500`}
                      />
                      <button
                        onClick={sendMessage}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes Panel (Doctor Only) */}
            {showNotes && userType === 'doctor' && (
              <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} overflow-hidden`} style={{ height: '520px' }}>
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                      <FileText className="w-5 h-5" />
                      Clinical Notes & Prescription
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                      <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                        Clinical Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="6"
                        placeholder="Enter clinical observations, symptoms, diagnosis..."
                        className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${textPrimary} bg-gray-50 dark:bg-gray-700 focus:outline-none focus:border-blue-500 resize-none`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                        Add Prescription
                      </label>
                      <div className="space-y-2 mb-2">
                        <input
                          type="text"
                          value={newMedicine.name}
                          onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                          placeholder="Medicine name"
                          className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${textPrimary} bg-gray-50 dark:bg-gray-700 focus:outline-none focus:border-blue-500`}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={newMedicine.dosage}
                            onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                            placeholder="Dosage"
                            className={`px-3 py-2 rounded-lg border ${borderColor} ${textPrimary} bg-gray-50 dark:bg-gray-700 focus:outline-none focus:border-blue-500`}
                          />
                          <input
                            type="text"
                            value={newMedicine.duration}
                            onChange={(e) => setNewMedicine({...newMedicine, duration: e.target.value})}
                            placeholder="Duration"
                            className={`px-3 py-2 rounded-lg border ${borderColor} ${textPrimary} bg-gray-50 dark:bg-gray-700 focus:outline-none focus:border-blue-500`}
                          />
                        </div>
                        <button
                          onClick={addMedicine}
                          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Medicine
                        </button>
                      </div>

                      {prescription.length > 0 && (
                        <div className="space-y-2">
                          <p className={`text-sm font-semibold ${textPrimary}`}>Prescribed Medicines:</p>
                          {prescription.map((med) => (
                            <div key={med.id} className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                              <div>
                                <p className={`font-semibold text-sm ${textPrimary}`}>{med.name}</p>
                                <p className={`text-xs ${textSecondary}`}>{med.dosage} - {med.duration}</p>
                              </div>
                              <button
                                onClick={() => removeMedicine(med.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Prescription
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Vitals Panel */}
            {showVitals && (
              <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} overflow-hidden`} style={{ height: '520px' }}>
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                      <Activity className="w-5 h-5" />
                      Patient Vitals
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Heart className="w-6 h-6 text-red-600" />
                        <span className={`font-semibold ${textPrimary}`}>Heart Rate</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-red-600">{vitals.heartRate}</span>
                        <span className={textSecondary}>bpm</span>
                      </div>
                      <div className="mt-2 h-2 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 w-3/4"></div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-6 h-6 text-blue-600" />
                        <span className={`font-semibold ${textPrimary}`}>Blood Pressure</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-blue-600">{vitals.bloodPressure}</span>
                        <span className={textSecondary}>mmHg</span>
                      </div>
                      <div className="mt-2 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 w-2/3"></div>
                      </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Thermometer className="w-6 h-6 text-orange-600" />
                        <span className={`font-semibold ${textPrimary}`}>Temperature</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-orange-600">{vitals.temperature}</span>
                        <span className={textSecondary}>°F</span>
                      </div>
                      <div className="mt-2 h-2 bg-orange-200 dark:bg-orange-800 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-600 w-1/2"></div>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-6 h-6 text-green-600" />
                        <span className={`font-semibold ${textPrimary}`}>Oxygen Level</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-green-600">{vitals.oxygenLevel}</span>
                        <span className={textSecondary}>%</span>
                      </div>
                      <div className="mt-2 h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 w-full"></div>
                      </div>
                    </div>

                    {userType === 'patient' && (
                      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Upload className="w-5 h-5" />
                        Update Vitals
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className={`${cardBg} rounded-2xl p-4 shadow-lg border ${borderColor}`}>
              <h3 className={`font-bold ${textPrimary} mb-3 text-sm`}>Session Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={textSecondary}>ID:</span>
                  <span className={`font-mono text-xs ${textPrimary}`}>{consultationInfo.consultationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className={textSecondary}>Started:</span>
                  <span className={textPrimary}>{consultationInfo.appointmentTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className={textSecondary}>Type:</span>
                  <span className={textPrimary}>Video Consultation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultation;



// Firebase Integration Points:
// 1. Authentication: User roles (doctor/patient)
// 2. Firestore: Store consultation data, prescriptions, chat
// 3. Storage: Medical documents, reports
// 4. Real-time Database: Live chat, call status

// Flask Backend API Endpoints:
// POST /api/consultation/start
// POST /api/consultation/end
// POST /api/prescription/create
// GET /api/vitals/:patientId
// POST /api/chat/send

// WebRTC for Video:
// - getUserMedia() for camera/mic access
// - RTCPeerConnection for peer-to-peer video
// - Socket.io for signaling