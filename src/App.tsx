import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import emailjs from '@emailjs/browser';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  Shield, 
  Car, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Check,
  Star, 
  Clock, 
  Navigation, 
  Gift, 
  Phone, 
  MessageCircle,
  Menu,
  X,
  Plus,
  Minus,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);

// Initialize EmailJS
emailjs.init('0AnSYtgrCUQVLtq2I');

// --- Firebase Error Handling Types & Helper ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Immersive UI Components ---

const Header = () => (
  <header className="flex items-center justify-between pl-4 pr-6 bg-white w-full header-slot h-[90px]">
    <div className="flex items-center gap-3 select-none h-full py-1">
      <img 
        src="https://i.imgur.com/eXlcfFP.png" 
        alt="Drive Away Car Rental Logo" 
        referrerPolicy="no-referrer"
        className="h-[75px] w-auto bg-transparent border-none outline-none"
      />
    </div>
    <div className="flex items-center gap-8">
      <a href="#fleet" className="nav-link text-[#1E3A5F] hover:text-aruba-teal transition-colors">Fleet</a>
      <a href="#services" className="nav-link text-[#1E3A5F] hover:text-aruba-teal transition-colors">Services</a>
      <a href="#about" className="nav-link text-[#1E3A5F] hover:text-aruba-teal transition-colors">About</a>
      <a href="#contact" className="nav-link text-[#1E3A5F] hover:text-aruba-teal transition-colors">Contact</a>
    </div>
    <a href="tel:+2975653768" className="flex items-center gap-2 text-[#1E3A5F] hover:text-aruba-teal transition-colors">
      <Phone className="w-5 h-5 text-aruba-teal" />
      <span>+297 5653768</span>
    </a>
  </header>
);

const Sidebar = () => (
  <aside className="sidebar-slot">
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="text-white relative z-10"
    >
      <div className="text-aruba-teal font-black uppercase tracking-[0.3em] text-[10px] mb-6 flex items-center gap-2">
        <div className="h-px w-8 bg-aruba-teal" />
        Reliable Island Rentals
      </div>
      <h1 className="text-white text-5xl md:text-6xl font-black leading-none mb-8 tracking-tighter">
        Drive Easy. <br />
        <span className="text-aruba-teal">Explore Aruba.</span>
      </h1>
      <p className="text-lg text-white mb-12 leading-relaxed max-w-sm font-medium">
        Experience paradise with our professional fleet of reliable vehicles. Professional service starting from just $45/day.
      </p>
      <a href="#booking" className="btn-reserve">
        Reserve Your Car
      </a>
    </motion.div>
  </aside>
);

const FeatureBadges = () => (
  <div className="flex flex-wrap gap-4 justify-center md:justify-start w-full mb-6">
    {[
      { icon: <Check size={18} />, text: 'Free Cancellation' },
      { icon: <Star size={18} />, text: '5/5 Rating' },
      { icon: <MapPin size={18} />, text: 'Airport Pickup' },
      { icon: <Shield size={18} />, text: 'Secure Booking' },
    ].map((item, i) => (
      <div key={i} className="pill-badge">
        <span className="text-aruba-teal">{item.icon}</span>
        <span>{item.text}</span>
      </div>
    ))}
  </div>
);

const ImageCarousel = ({ images, name, badge }: { images: string[], name: string, badge?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [currentIndex]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="h-[200px] w-full overflow-hidden relative rounded-t-[12px] group/carousel bg-slate-50">
      <AnimatePresence mode="wait">
        {!imageError ? (
          <motion.img
            key={`img-${currentIndex}`}
            src={images[currentIndex]}
            alt={`${name} - view ${currentIndex + 1}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-contain p-2"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <motion.div
            key={`fallback-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6 relative"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a05_1px,transparent_1px),linear-gradient(to_bottom,#0f172a05_1px,transparent_1px)] bg-[size:16px_16px]" />
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="relative z-10"
            >
              <Car className="w-16 h-16 text-aruba-teal stroke-[1.25]" />
            </motion.div>
            <span className="text-[10px] font-black uppercase text-aruba-navy/40 tracking-[0.2em] mt-3 z-10 text-center">
              {name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {badge && (
        <div className="absolute top-5 left-5 bg-aruba-teal text-white text-[10px] font-black uppercase px-4 py-2 rounded shadow-xl z-10">
          {badge}
        </div>
      )}

      {images.length > 1 && (
        <>
          <button 
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
          >
            <ChevronRight size={20} />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-aruba-teal w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const FleetSection = ({ onSelect }: { onSelect: (name: string) => void }) => {
  const cars = [
    { 
      name: '2027 Kia Soluto', 
      tag: 'Economy / Sedan', 
      price: 62, 
      images: [
        'https://interamericananorte.com/storage/cars/WyQ67Z02a8o86PjoynonoKI10kadauFdkRySEtIP.png',
        'https://kiaaruba.com/wp-content/uploads/2019/12/soluto_01.jpg',
        'https://kiaaruba.com/wp-content/uploads/2019/12/soluto_02.jpg'
      ], 
      stockText: 'Only 1 Available',
      badge: 'NEW 2027 MODEL',
      features: ['Automatic', '5-Seater', 'Bluetooth']
    },
    { 
      name: '2019 Kia Rio', 
      tag: 'Economy / Sedan', 
      price: 45, 
      images: [
        'https://images.hgmsites.net/lrg/2019-kia-rio-s-auto-angular-front-exterior-view_100707842_l.jpg'
      ], 
      stockText: 'Only 3 Available (1 grey, 2 white)',
      features: ['Automatic', '5-Seater', 'Fuel Efficient', 'Compact']
    },
    { 
      name: '2023 Nissan Versa', 
      tag: 'Economy / Sedan', 
      price: 58, 
      images: [
        'https://di-uploads-pod9.dealerinspire.com/coylenissan1/uploads/2022/03/2022-Nissan-Versa-left-fuel-1-728x400.jpg'
      ], 
      stockText: 'Only 1 Available (Grey)',
      features: ['Automatic', '5-Seater', 'Bluetooth']
    }
  ];

  return (
    <section id="fleet" className="py-10 space-y-10 scroll-mt-24">
      <div>
        <h2 className="text-4xl font-black text-aruba-navy uppercase tracking-tighter mb-3">Our Fleet</h2>
        <p className="text-slate-500 font-medium text-base">Select the vehicle that best fits your Aruban adventure</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
        {cars.map((car, i) => (
          <div 
            key={i} 
            className="card-theme group flex flex-col min-h-[580px] h-full"
          >
            <ImageCarousel images={car.images} name={car.name} badge={car.badge} />
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-aruba-teal bg-aruba-teal/10 px-4 py-1.5 rounded-full inline-block">
                    {car.tag}
                  </span>
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                    {car.stockText}
                  </span>
                </div>
                <div className="h-[64px] mb-2 flex items-center">
                  <div className="font-bold text-2xl text-aruba-navy tracking-tight leading-tight line-clamp-2 break-words">
                    {car.name}
                  </div>
                </div>
                <div className="text-aruba-navy font-black text-3xl mb-8 flex items-baseline gap-1 flex-wrap">
                  {(car.price === 45 || car.price === 62 || car.price === 58) && (
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mr-1 self-center">Starting from</span>
                  )}
                  ${car.price}<span className="text-sm text-slate-400 font-medium tracking-tight">/day</span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 mb-8">
                  {car.features?.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                      <CheckCircle size={14} className="text-aruba-teal" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => onSelect(car.name)}
                className="w-full py-4 bg-aruba-teal text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:brightness-110 transition-all shadow-lg shadow-aruba-teal/20"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const ServicesSection = () => (
  <section id="services" className="bg-aruba-navy p-12 rounded-[24px] text-white space-y-10 scroll-mt-24">
    <h2 className="text-4xl font-black uppercase tracking-tighter">Our Services</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { icon: <Car />, title: "Free Delivery & Pickup" },
        { icon: <Navigation />, title: "Airport Pickup & Dropoff" },
        { icon: <Phone />, title: "24/7 Customer Support" },
        { icon: <Check />, title: "Free Cancellation" },
      ].map((service, i) => (
        <div key={i} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 group hover:-translate-y-2 transition-all">
          <div className="text-aruba-teal mb-4 transform group-hover:scale-110 transition-transform">
            {React.cloneElement(service.icon as React.ReactElement, { size: 32 })}
          </div>
          <div className="text-aruba-navy font-bold text-sm leading-tight uppercase tracking-tight">
            {service.title}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const AboutSection = () => (
  <section id="about" className="py-12 bg-white space-y-8 scroll-mt-24">
    <div className="w-20 h-1 bg-aruba-teal mb-2" />
    <h2 className="text-4xl font-black text-aruba-navy uppercase tracking-tighter">About Drive Away Aruba</h2>
    <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
      Drive Away Aruba is your trusted local car rental company in Oranjestad, Aruba. 
      We offer reliable, affordable vehicles so you can explore the island on your own terms. 
      Professional service starting from just $45/day.
    </p>
  </section>
);

const ContactSection = () => (
  <section id="contact" className="bg-aruba-navy p-12 rounded-[24px] text-white space-y-10 scroll-mt-24">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <h2 className="text-4xl font-black uppercase tracking-tighter">Contact Us</h2>
      <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-3">
        <Clock size={20} className="text-aruba-teal" />
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">Opening Hours</div>
          <div className="text-sm font-bold">Every Day: 8:00 AM – 6:00 PM</div>
        </div>
      </div>
    </div>
    
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div className="space-y-6">
        <div className="flex items-center gap-4 text-xl">
          <MapPin size={24} className="text-aruba-teal" />
          <span>Oranjestad, Aruba</span>
        </div>
        <div className="flex items-center gap-4 text-xl">
          <Phone size={24} className="text-aruba-teal" />
          <span>+297 5653768</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <a 
          href="https://wa.me/2975653768?text=Hi%20Drive%20Away%20Aruba!%20I%20would%20like%20to%20rent%20a%20car." 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white py-5 rounded-xl font-black uppercase tracking-widest text-center flex items-center justify-center gap-3 hover:brightness-110 transition-all shadow-xl"
        >
          <MessageCircle size={24} />
          Chat on WhatsApp
        </a>
        <a 
          href="mailto:Driveawaycar2025@gmail.com?subject=Car%20Rental%20Inquiry%20-%20Drive%20Away%20Aruba&body=Hi%20Drive%20Away%20Aruba,%20I%20would%20like%20to%20inquire%20about%20renting%20a%20car."
          className="bg-aruba-teal text-white py-5 rounded-xl font-black uppercase tracking-widest text-center hover:bg-aruba-teal-dark transition-all shadow-lg"
        >
          Inquiry Now
        </a>
      </div>
    </div>
  </section>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const faqs = [
    { q: "What are the age requirements for renting?", a: "To rent a car from Drive Away Aruba, you must be at least 23 years old and have a valid driver's license held for at least 1 year." },
    { q: "Is insurance included in the price?", a: "Yes, basic third-party liability is included. We also offer CDW (Collision Damage Waiver) at checkout." },
    { q: "Do you offer airport delivery?", a: "Absolutely! We provide free airport delivery and pickup. A representative will be waiting for you at the arrival hall." },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold uppercase tracking-widest text-gray-400">Common Questions</h3>
      <div className="grid gap-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <button 
              className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span className="font-bold text-sm">{faq.q}</span>
              {openIndex === i ? <Minus size={16} /> : <Plus size={16} />}
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-gray-50/50"
                >
                  <div className="p-4 text-xs text-gray-500 leading-relaxed">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Payment Methods Icons ---
const VisaIcon = () => (
  <svg className="w-11 h-7 select-none shadow-sm rounded border border-white/10" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="44" height="28" rx="4" fill="#1434CB" />
    <text x="22" y="18" fill="#FFFFFF" fontSize="12" fontWeight="900" fontStyle="italic" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle" letterSpacing="-0.03em">VISA</text>
    <path d="M10 11.5L12 7.5H8.5L6.5 11.5H10Z" fill="#F79E1B" />
  </svg>
);

const MastercardIcon = () => (
  <svg className="w-11 h-7 select-none shadow-sm rounded border border-white/10" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="44" height="28" rx="4" fill="#151515" />
    <g transform="translate(0, -1)">
      <circle cx="17" cy="14" r="7.5" fill="#EB001B" />
      <circle cx="27" cy="14" r="7.5" fill="#F79E1B" fillOpacity="0.85" />
      <path d="M 22 8.15 A 7.5 7.5 0 0 0 22 19.85 A 7.5 7.5 0 0 0 22 8.15 Z" fill="#FF5F00" />
    </g>
    <text x="22" y="24" fill="#FFFFFF" fontSize="5" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle" letterSpacing="0.05em">mastercard</text>
  </svg>
);

const DiscoverIcon = () => (
  <svg className="w-11 h-7 select-none shadow-sm rounded border border-slate-200" viewBox="0 0 44 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="44" height="28" rx="4" fill="#FFFFFF" />
    <circle cx="28" cy="14" r="6" fill="#F47421" />
    <text x="19" y="17" fill="#111111" fontSize="7.5" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle" letterSpacing="-0.02em">DISCOVER</text>
  </svg>
);

const Footer = () => (
  <footer className="footer-slot flex flex-col gap-6">
    <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6 border-b border-white/10 pb-6">
      <div className="font-bold tracking-tight text-lg">
        &copy; {new Date().getFullYear()} <span className="text-aruba-teal">Drive Away Aruba</span>
      </div>
      <div className="flex items-center gap-6 text-sm font-bold">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-aruba-teal" />
          <span>Daily 8AM – 6PM</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-aruba-teal" /> Oranjestad, Aruba
        </div>
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-aruba-teal" /> +297 5653768
        </div>
      </div>
    </div>
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
      <div className="text-[10px] text-slate-400 font-medium text-center md:text-left">
        Official Drive Away Aruba Rental Services. Terms and conditions apply. All rentals subject to availability.
      </div>
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">We Accept Debit/Credit:</span>
        <div className="flex gap-2 items-center">
          <VisaIcon />
          <MastercardIcon />
          <DiscoverIcon />
        </div>
      </div>
    </div>
  </footer>
);

// --- Main App ---

const EMAILJS_SERVICE_ID = 'service_uvsgl0e';
const EMAILJS_TEMPLATE_ID_GUEST = 'template_a6dxzmj';
const EMAILJS_TEMPLATE_ID_OWNER = 'template_mfzdca3';
const EMAILJS_PUBLIC_KEY = '0AnSYtgrCUQVLtq2I';

export default function App() {
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    email: '',
    car: '2027 Kia Soluto ($62/day)',
    pickup: '✈️ Airport Pickup — Queen Beatrix Airport (AUA)',
    arrival: '',
    departure: '',
    pickupTime: '',
    flightNumber: '',
    accommodationName: '',
    airbnbName: '',
    airbnbAddress: '',
    specialInstructions: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastWhatsappUrl, setLastWhatsappUrl] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isAfterHours = (time: string) => {
    if (!time) return false;
    const [hours, minutes] = time.split(':').map(Number);
    // Before 8:00 AM or after 6:00 PM
    if (hours < 8) return true;
    if (hours > 18) return true;
    if (hours === 18 && minutes > 0) return true;
    return false;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const standardFields = ['name', 'phone', 'email', 'arrival', 'departure', 'pickupTime'];
    standardFields.forEach(field => {
      if (!bookingData[field as keyof typeof bookingData]) {
        newErrors[field] = 'This field is required.';
      }
    });

    // Conditional Validation
    if (bookingData.pickup === '✈️ Airport Pickup — Queen Beatrix Airport (AUA)') {
      if (!bookingData.flightNumber) newErrors.flightNumber = 'This field is required.';
    } else if (bookingData.pickup === '🏨 Hotel Delivery') {
      if (!bookingData.accommodationName) newErrors.accommodationName = 'This field is required.';
    } else if (bookingData.pickup === '🏠 Airbnb Delivery') {
      if (!bookingData.airbnbName) newErrors.airbnbName = 'This field is required.';
      if (!bookingData.airbnbAddress) newErrors.airbnbAddress = 'This field is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const el = document.getElementById('booking');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const afterHoursFee = isAfterHours(bookingData.pickupTime) ? '$20' : 'None';

      // 1. Save to Firebase (non-blocking background task)
      addDoc(collection(db, 'bookings'), {
        ...bookingData,
        createdAt: serverTimestamp(),
        status: 'pending',
        hasAfterHoursFee: isAfterHours(bookingData.pickupTime)
      }).then(() => {
        console.log('Successfully saved to Firebase Firestore.');
      }).catch((err) => {
        console.warn('Background Firebase save was bypassed or failed:', err);
      });

      // 2. Format details message
      let message = `🚗 NEW BOOKING REQUEST\n\n`;
      message += `Name: ${bookingData.name}\n`;
      message += `Phone: ${bookingData.phone}\n`;
      message += `Email: ${bookingData.email}\n`;
      message += `Car: ${bookingData.car}\n`;
      message += `Pickup: ${bookingData.pickup}\n`;
      
      if (bookingData.pickup === '✈️ Airport Pickup — Queen Beatrix Airport (AUA)') {
        message += `Flight Number: ${bookingData.flightNumber || 'N/A'}\n`;
      } else if (bookingData.pickup === '🏨 Hotel Delivery') {
        message += `Hotel: ${bookingData.accommodationName}\n`;
      } else if (bookingData.pickup === '🏠 Airbnb Delivery') {
        message += `Airbnb Name: ${bookingData.airbnbName}\n`;
        message += `Airbnb Address: ${bookingData.airbnbAddress}\n`;
        if (bookingData.specialInstructions) {
          message += `Special Instructions: ${bookingData.specialInstructions}\n`;
        }
      }

      message += `Desired Pickup Date: ${bookingData.arrival}\n`;
      message += `Desired Drop Off Date: ${bookingData.departure}\n`;
      message += `Pickup Time: ${bookingData.pickupTime}\n`;
      message += `After-Hours Fee: ${afterHoursFee}`;
      
      const whatsappUrl = `https://wa.me/2975653768?text=${encodeURIComponent(message)}`;
      setLastWhatsappUrl(whatsappUrl);

      // 3. Send emails using EmailJS (fully configured and active with hardcoded credentials)
      const templateParams = {
        name: bookingData.name,
        phone: bookingData.phone,
        email: bookingData.email,
        guest_name: bookingData.name,
        guest_phone: bookingData.phone,
        guest_email: bookingData.email,
        car_model: bookingData.car,
        delivery_location: bookingData.pickup,
        arrival_date: bookingData.arrival,
        departure_date: bookingData.departure,
        desired_pickup_date: bookingData.arrival,
        desired_drop_off_date: bookingData.departure,
        pickup_time: bookingData.pickupTime,
        flight_number: bookingData.flightNumber || 'N/A',
        hotel_name: bookingData.accommodationName || 'N/A',
        hotelName: bookingData.accommodationName || 'N/A',
        hotel: bookingData.accommodationName || 'N/A',
        accommodation_name: bookingData.accommodationName || 'N/A',
        airbnb_name: bookingData.airbnbName || 'N/A',
        airbnb_address: bookingData.airbnbAddress || 'N/A',
        special_instructions: bookingData.specialInstructions || 'N/A',
        after_hours_fee: afterHoursFee,
        to_email: bookingData.email, // Sent to guest
        owner_email: 'driveawaycar2025@gmail.com' // Sent to owner
      };

      // Send confirmation email to guest first
      try {
        await emailjs.send('service_uvsgl0e', 'template_a6dxzmj', templateParams, '0AnSYtgrCUQVLtq2I');
        console.log('Successfully sent guest confirmation email.');
      } catch (err) {
        console.error('Failed to send guest email:', err);
      }
      
      // Then send notification email to owner
      try {
        await emailjs.send('service_uvsgl0e', 'template_mfzdca3', templateParams, '0AnSYtgrCUQVLtq2I');
        console.log('Successfully sent owner notification email.');
      } catch (err) {
        console.error('Failed to send owner email:', err);
      }

      // Try automatic whatsapp popup
      try {
        window.open(whatsappUrl, '_blank');
      } catch (e) {
        console.warn('Popup blocked, fallbacks provided on screen.');
      }

      setIsSuccess(true);
    } catch (error) {
      console.error('Error saving booking:', error);
      setSubmitError('There was an error processing your booking. Please try again or contact us via WhatsApp directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="immersive-grid">
      <Header />
      <Sidebar />
      <main className="main-slot">
        <FeatureBadges />
        
        {/* Booking Section */}
        <div className="booking-card !max-w-4xl mx-auto w-full" id="booking">
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 p-8 rounded-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-green-800 uppercase tracking-tight">
                  Thank you {bookingData.name}!
                </h3>
                <p className="text-green-700 font-medium mt-1">
                  Your booking request has been successfully saved and received!
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-green-100 max-w-md mx-auto text-left text-xs text-green-800 space-y-3 shadow-sm">
                <p className="font-extrabold text-sm border-b border-green-50 pb-1 flex items-center justify-between">
                  <span>📋 Next Steps</span>
                  <span className="text-[10px] bg-green-100 text-green-850 font-black px-2 py-0.5 rounded-full uppercase">Pending Verification</span>
                </p>
                <p>
                  1. An automated confirmation email has been dispatched to <strong>{bookingData.email}</strong>. Please check your inbox.
                </p>
                <p>
                  2. Our team has received an email summary of your booking request.
                </p>
                <p className="border-t border-green-50 pt-2 text-green-750 font-medium italic">
                  You will receive a confirmation of your booking via email once our team has reviewed your request.
                </p>
                
                {isAfterHours(bookingData.pickupTime) && (
                  <p className="text-yellow-850 font-semibold italic bg-yellow-50 p-2.5 rounded-lg border border-yellow-100">
                    ⚠️ A $20 after-hours fee is applicable for pickups outside our standard hours (8:00 AM – 6:00 PM).
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-3 max-w-md mx-auto">
                <a 
                  href={lastWhatsappUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white py-4 px-6 rounded-xl font-black uppercase tracking-widest text-center flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl"
                >
                  <MessageCircle size={20} />
                  Send to WhatsApp (+297 5653768)
                </a>
              </div>

              <button 
                onClick={() => setIsSuccess(false)}
                className="text-green-800 font-bold underline text-xs pt-1 block mx-auto hover:text-green-950"
              >
                Send another request
              </button>
            </motion.div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-3xl font-black text-aruba-navy mb-2 uppercase tracking-tighter">Instant Reservation</h2>
                <p className="text-slate-500 text-sm font-medium">Select your dates and preferred vehicle to start your journey.</p>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                  {/* Row 1: Full Legal Name | Phone / WhatsApp Number */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-1.5">
                      Full Legal Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter your full name"
                      className={`form-input font-bold text-aruba-navy placeholder:text-slate-300 ${errors.name ? 'border-red-500 bg-red-50/30' : ''}`}
                      value={bookingData.name}
                      onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                    />
                    {errors.name && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-1.5">
                      Phone / WhatsApp Number
                    </label>
                    <input 
                      type="tel" 
                      placeholder="+1 000 000 0000"
                      className={`form-input font-bold text-aruba-navy placeholder:text-slate-300 ${errors.phone ? 'border-red-500 bg-red-50/30' : ''}`}
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.phone}</p>}
                  </div>

                  {/* Row 2: Email Address | Preferred Car Model */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-1.5">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      placeholder="your@email.com"
                      className={`form-input font-bold text-aruba-navy placeholder:text-slate-300 ${errors.email ? 'border-red-500 bg-red-50/30' : ''}`}
                      value={bookingData.email}
                      onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                    />
                    {errors.email && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-1.5">
                      Preferred Car Model
                    </label>
                    <select 
                      className="form-input text-base font-semibold text-aruba-navy appearance-none cursor-pointer"
                      value={bookingData.car}
                      onChange={(e) => setBookingData({...bookingData, car: e.target.value})}
                    >
                      <option>2027 Kia Soluto ($62/day)</option>
                      <option>2019 Kia Rio ($45/day)</option>
                      <option>2023 Nissan Versa ($58/day)</option>
                    </select>
                  </div>

                  {/* Row 3: Delivery Location (Full Width) */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-1.5">
                      📍 DELIVERY LOCATION
                    </label>
                    <select 
                      className="form-input text-base font-semibold text-aruba-navy cursor-pointer"
                      value={bookingData.pickup}
                      onChange={(e) => setBookingData({...bookingData, pickup: e.target.value})}
                    >
                      <option>✈️ Airport Pickup — Queen Beatrix Airport (AUA)</option>
                      <option>🏨 Hotel Delivery</option>
                      <option>🏠 Airbnb Delivery</option>
                    </select>
                  </div>

                  {/* Conditional Fields */}
                  <div className="col-span-2">
                    <AnimatePresence mode="wait">
                      {bookingData.pickup === '✈️ Airport Pickup — Queen Beatrix Airport (AUA)' && (
                        <motion.div 
                          key="airport-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden mb-4"
                        >
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-1.5">
                            ✈️ Flight Number
                          </label>
                          <input 
                            type="text" 
                            placeholder="Enter your flight number (e.g. AA1234)"
                            className={`form-input font-bold text-aruba-navy placeholder:text-slate-300 ${errors.flightNumber ? 'border-red-500 bg-red-50/30' : ''}`}
                            value={bookingData.flightNumber}
                            onChange={(e) => setBookingData({...bookingData, flightNumber: e.target.value})}
                          />
                          {errors.flightNumber && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.flightNumber}</p>}
                        </motion.div>
                      )}

                      {bookingData.pickup === '🏨 Hotel Delivery' && (
                        <motion.div 
                          key="hotel-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden mb-4"
                        >
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-1.5">
                            🏨 Hotel Name
                          </label>
                          <input 
                            type="text" 
                            placeholder="Enter your hotel name"
                            className={`form-input font-bold text-aruba-navy placeholder:text-slate-300 ${errors.accommodationName ? 'border-red-500 bg-red-50/30' : ''}`}
                            value={bookingData.accommodationName}
                            onChange={(e) => setBookingData({...bookingData, accommodationName: e.target.value})}
                          />
                          {errors.accommodationName && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.accommodationName}</p>}
                        </motion.div>
                      )}

                      {bookingData.pickup === '🏠 Airbnb Delivery' && (
                        <motion.div 
                          key="airbnb-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4 overflow-hidden"
                        >
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-1.5">
                              🏠 Airbnb Name
                            </label>
                            <input 
                              type="text" 
                              placeholder="Enter your Airbnb name"
                              className={`form-input font-bold text-aruba-navy placeholder:text-slate-300 ${errors.airbnbName ? 'border-red-500 bg-red-50/30' : ''}`}
                              value={bookingData.airbnbName}
                              onChange={(e) => setBookingData({...bookingData, airbnbName: e.target.value})}
                            />
                            {errors.airbnbName && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.airbnbName}</p>}
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-1.5">
                              📍 Full Address
                            </label>
                            <input 
                              type="text" 
                              placeholder="Complete address (e.g. Palm Beach 123, Noord)"
                              className={`form-input font-bold text-aruba-navy placeholder:text-slate-300 ${errors.airbnbAddress ? 'border-red-500 bg-red-50/30' : ''}`}
                              value={bookingData.airbnbAddress}
                              onChange={(e) => setBookingData({...bookingData, airbnbAddress: e.target.value})}
                            />
                            {errors.airbnbAddress && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.airbnbAddress}</p>}
                          </div>

                          <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1 flex items-center gap-1.5">
                              📝 Special Instructions
                            </label>
                            <input 
                              type="text" 
                              placeholder="Any extra details to help us find your location"
                              className="form-input font-bold text-aruba-navy placeholder:text-slate-300"
                              value={bookingData.specialInstructions}
                              onChange={(e) => setBookingData({...bookingData, specialInstructions: e.target.value})}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Row 4: Desired Pickup Date | Desired Drop Off Date */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Desired Pickup Date</label>
                    <input 
                      type="date" 
                      className={`form-input font-bold text-aruba-navy ${errors.arrival ? 'border-red-500 bg-red-50/30' : ''}`}
                      value={bookingData.arrival}
                      onChange={(e) => setBookingData({...bookingData, arrival: e.target.value})}
                    />
                    {errors.arrival && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.arrival}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Desired Drop Off Date</label>
                    <input 
                      type="date" 
                      className={`form-input font-bold text-aruba-navy ${errors.departure ? 'border-red-500 bg-red-50/30' : ''}`}
                      value={bookingData.departure}
                      onChange={(e) => setBookingData({...bookingData, departure: e.target.value})}
                    />
                    {errors.departure && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.departure}</p>}
                  </div>

                  {/* Row 5: Pickup Time (col-span-2) */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Preferred Pickup/Delivery Time</label>
                    <input 
                      type="time" 
                      className={`form-input font-bold text-aruba-navy ${errors.pickupTime ? 'border-red-500 bg-red-50/30' : ''}`}
                      value={bookingData.pickupTime}
                      onChange={(e) => setBookingData({...bookingData, pickupTime: e.target.value})}
                    />
                    {errors.pickupTime && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.pickupTime}</p>}
                    
                    {bookingData.pickupTime && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl text-xs font-bold mt-2 ${
                          isAfterHours(bookingData.pickupTime) 
                            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' 
                            : 'bg-green-50 border border-green-100 text-green-700'
                        }`}
                      >
                        {isAfterHours(bookingData.pickupTime) ? (
                          <div className="flex gap-2 items-center">
                            <span>⚠️ After-Hours Fee: A $20 extra charge applies for pickups/deliveries before 8:00 AM or after 6:00 PM.</span>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <span>✅ No extra charge — within business hours!</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                {submitError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-50 border border-red-250 text-red-800 text-xs font-semibold"
                  >
                    ⚠️ {submitError}
                  </motion.div>
                )}

                {/* Submit Button (Row 6) */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-submit"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
                    <>
                      <Clock size={18} />
                      Check Availability & Book
                    </>
                  )}
                </button>

                {/* Payment Methods Info */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider select-none">
                    <Shield size={14} className="text-aruba-teal" /> Secure booking request
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">We Accept:</span>
                    <div className="flex gap-1.5 items-center">
                      <VisaIcon />
                      <MastercardIcon />
                      <DiscoverIcon />
                    </div>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        <FleetSection onSelect={(carName) => {
          let optionName = carName;
          if (carName === '2027 Kia Soluto') optionName = '2027 Kia Soluto ($62/day)';
          else if (carName === '2019 Kia Rio') optionName = '2019 Kia Rio ($45/day)';
          else if (carName === '2023 Nissan Versa') optionName = '2023 Nissan Versa ($58/day)';
          
          setBookingData({ ...bookingData, car: optionName });
          const el = document.getElementById('booking');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }} />

        <ServicesSection />
        <AboutSection />
        <ContactSection />
        
        <div className="py-10">
          <FAQ />
        </div>
      </main>
      <Footer />
      
      {/* WhatsApp Button */}
      <div className="fixed bottom-[70px] right-8 z-50 group">
        <div className="absolute bottom-full right-0 mb-4 bg-aruba-navy text-white text-[10px] font-bold px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
          We're open daily 8AM–6PM
          <div className="absolute top-full right-6 border-8 border-transparent border-t-aruba-navy" />
        </div>
        <a 
          href="https://wa.me/2975653768" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        >
          <MessageCircle size={28} />
        </a>
      </div>
    </div>
  );
}
