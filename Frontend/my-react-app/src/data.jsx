export const mockDoctors = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    specialty: "Cardiology",
    experience: 15,
    clinic: "Heart Care Clinic",
    distance: 1.2,
    nextSlot: "10:30 AM",
    fees: 500,
    photo: "👨‍⚕️",
    qualification: "MBBS, MD (Cardiology)",
    rating: 4.8,
    address: "Shop 12, Main Road, Dadar West",
    slots: ["10:30 AM", "11:00 AM", "2:00 PM", "3:30 PM"],
    verified: true,
    online: true,
    languages: ["English", "Hindi", "Marathi"]
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    specialty: "Orthopedics",
    experience: 10,
    clinic: "Bone & Joint Center",
    distance: 2.5,
    nextSlot: "11:00 AM",
    fees: 600,
    photo: "👩‍⚕️",
    qualification: "MBBS, MS (Ortho)",
    rating: 4.6,
    address: "2nd Floor, Shivaji Park",
    slots: ["11:00 AM", "12:00 PM", "4:00 PM", "5:00 PM"],
    verified: true,
    online: false,
    languages: ["English", "Hindi"]
  },
  {
    id: 3,
    name: "Dr. Amit Patil",
    specialty: "Dental",
    experience: 8,
    clinic: "Smile Dental Care",
    distance: 0.8,
    nextSlot: "9:00 AM",
    fees: 400,
    photo: "👨‍⚕️",
    qualification: "BDS, MDS",
    rating: 4.9,
    address: "Ground Floor, Prabhadevi",
    slots: ["9:00 AM", "10:00 AM", "3:00 PM", "6:00 PM"],
    verified: true,
    online: true,
    languages: ["English", "Hindi", "Marathi", "Gujarati"]
  }
];

export const specialties = [
  { name: "Cardiology", icon: "❤️", color: "from-red-500 to-pink-600" },
  { name: "Orthopedics", icon: "🦴", color: "from-blue-500 to-cyan-600" },
  { name: "Dental", icon: "🦷", color: "from-emerald-500 to-teal-600" },
  { name: "ENT", icon: "👂", color: "from-purple-500 to-indigo-600" },
  { name: "Dermatology", icon: "🩺", color: "from-orange-500 to-amber-600" },
  { name: "Pediatrics", icon: "👶", color: "from-rose-500 to-pink-600" }
];