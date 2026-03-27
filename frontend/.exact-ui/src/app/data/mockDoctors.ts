export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  image: string;
  location: string;
  hospital: string;
  fee: number;
  experience: number;
  rating: number;
  reviews: number;
  lat: number;
  lng: number;
  bio: string;
  qualifications: string[];
  languages: string[];
  availableDays: string[];
  timeSlots: string[];
}

export const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Mitchell",
    specialization: "Cardiology",
    image: "https://images.unsplash.com/photo-1734002886107-168181bcd6a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBmZW1hbGUlMjBkb2N0b3IlMjBzbWlsaW5nfGVufDF8fHx8MTc3Mzg3Mjc3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    location: "New York, NY",
    hospital: "Mount Sinai Hospital",
    fee: 250,
    experience: 12,
    rating: 4.9,
    reviews: 342,
    lat: 40.7128,
    lng: -74.0060,
    bio: "Board-certified cardiologist with over 12 years of experience in treating heart conditions. Specialized in preventive cardiology and interventional procedures.",
    qualifications: ["MD - Harvard Medical School", "Fellowship - Johns Hopkins", "Board Certified - American Board of Internal Medicine"],
    languages: ["English", "Spanish"],
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },
  {
    id: "2",
    name: "Dr. James Wilson",
    specialization: "Orthopedics",
    image: "https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYWxlJTIwZG9jdG9yJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczODcyNzczfDA&ixlib=rb-4.1.0&q=80&w=1080",
    location: "Brooklyn, NY",
    hospital: "NYU Langone Health",
    fee: 200,
    experience: 15,
    rating: 4.8,
    reviews: 289,
    lat: 40.6782,
    lng: -73.9442,
    bio: "Expert orthopedic surgeon specializing in sports medicine and joint replacement. Committed to helping patients regain mobility and improve quality of life.",
    qualifications: ["MD - Columbia University", "Residency - Mayo Clinic", "Fellowship - Sports Medicine"],
    languages: ["English"],
    availableDays: ["Monday", "Wednesday", "Friday"],
    timeSlots: ["08:00 AM", "09:00 AM", "10:00 AM", "01:00 PM", "02:00 PM"]
  },
  {
    id: "3",
    name: "Dr. Michael Chen",
    specialization: "Dermatology",
    image: "https://images.unsplash.com/photo-1632054229795-4097870879b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYW1lcmljYW4lMjBkb2N0b3IlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczOTQzNjE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    location: "Queens, NY",
    hospital: "Northwell Health",
    fee: 180,
    experience: 8,
    rating: 4.7,
    reviews: 156,
    lat: 40.7282,
    lng: -73.7949,
    bio: "Dermatologist specializing in medical and cosmetic dermatology. Passionate about helping patients achieve healthy, glowing skin.",
    qualifications: ["MD - Yale School of Medicine", "Dermatology Residency - Stanford"],
    languages: ["English", "Mandarin"],
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    timeSlots: ["10:00 AM", "11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM"]
  },
  {
    id: "4",
    name: "Dr. Emily Park",
    specialization: "Pediatrics",
    image: "https://images.unsplash.com/photo-1576669802218-d535933f897c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGZlbWFsZSUyMGRvY3RvciUyMG1lZGljYWx8ZW58MXx8fHwxNzczOTQzNjE3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    location: "Manhattan, NY",
    hospital: "NewYork-Presbyterian",
    fee: 160,
    experience: 10,
    rating: 4.9,
    reviews: 412,
    lat: 40.7831,
    lng: -73.9712,
    bio: "Pediatrician dedicated to providing comprehensive care for children from infancy through adolescence. Focused on preventive care and developmental milestones.",
    qualifications: ["MD - University of Pennsylvania", "Pediatric Residency - Children's Hospital of Philadelphia"],
    languages: ["English", "Korean"],
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    timeSlots: ["08:30 AM", "09:30 AM", "10:30 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
  },
  {
    id: "5",
    name: "Dr. Robert Thompson",
    specialization: "Neurology",
    image: "https://images.unsplash.com/photo-1645066928295-2506defde470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZW5pb3IlMjBtYWxlJTIwZG9jdG9yJTIwZXhwZXJpZW5jZWR8ZW58MXx8fHwxNzczOTQzNjE3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    location: "Bronx, NY",
    hospital: "Montefiore Medical Center",
    fee: 280,
    experience: 20,
    rating: 4.8,
    reviews: 267,
    lat: 40.8448,
    lng: -73.8648,
    bio: "Senior neurologist with extensive experience in treating neurological disorders. Specializes in stroke prevention and management of chronic neurological conditions.",
    qualifications: ["MD - Johns Hopkins University", "Neurology Fellowship - Cleveland Clinic", "Board Certified - American Board of Psychiatry and Neurology"],
    languages: ["English", "French"],
    availableDays: ["Monday", "Wednesday", "Thursday"],
    timeSlots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"]
  },
  {
    id: "6",
    name: "Dr. Lisa Rodriguez",
    specialization: "Cardiology",
    image: "https://images.unsplash.com/photo-1734002886107-168181bcd6a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBmZW1hbGUlMjBkb2N0b3IlMjBzbWlsaW5nfGVufDF8fHx8MTc3Mzg3Mjc3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    location: "Staten Island, NY",
    hospital: "Richmond University Medical Center",
    fee: 220,
    experience: 9,
    rating: 4.6,
    reviews: 178,
    lat: 40.5795,
    lng: -74.1502,
    bio: "Cardiologist focused on women's heart health and preventive cardiology. Committed to patient education and holistic heart care.",
    qualifications: ["MD - Duke University", "Cardiology Fellowship - Brigham and Women's Hospital"],
    languages: ["English", "Spanish", "Portuguese"],
    availableDays: ["Tuesday", "Thursday", "Friday"],
    timeSlots: ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"]
  }
];

export const specializations = [
  "All Specializations",
  "Cardiology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Psychiatry",
  "General Medicine",
  "Gynecology",
  "Ophthalmology"
];
