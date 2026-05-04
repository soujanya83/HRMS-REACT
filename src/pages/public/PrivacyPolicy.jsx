import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaArrowLeft, FaRegFileAlt, FaUserSecret, FaLock, FaDatabase, FaRegCheckCircle, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import logo1 from "../../assets/logo1.png";
import logoText from "../../assets/logotext.png";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, index) => {
      return new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(index);
          }
        },
        { threshold: 0.5 }
      );
    });

    sectionRefs.current.forEach((ref, index) => {
      if (ref) observers[index].observe(ref);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  const sections = [
    {
      id: "intro",
      title: "1. Introduction",
      icon: <FaShieldAlt />,
      content: "This Privacy Policy explains how CHRISPP collects, uses, and protects personal data."
    },
    {
      id: "collect",
      title: "2. Information We Collect",
      icon: <FaDatabase />,
      content: (
        <div className="space-y-8">
          <div className="relative p-6 bg-white border-l-4 border-blue-500 shadow-sm rounded-r-xl">
            <h4 className="text-xl font-bold text-slate-900 mb-4">a. Personal Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Name, email, phone number</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Employee ID, designation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Address, date of birth</span>
              </div>
            </div>
          </div>
          <div className="relative p-6 bg-white border-l-4 border-indigo-500 shadow-sm rounded-r-xl">
            <h4 className="text-xl font-bold text-slate-900 mb-4">b. Employment Data</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Attendance, leave records</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Payroll, salary details</span>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Performance data</span>
              </div>
            </div>
          </div>
          <div className="relative p-6 bg-white border-l-4 border-purple-500 shadow-sm rounded-r-xl">
            <h4 className="text-xl font-bold text-slate-900 mb-4">c. Device & Usage Data</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-600">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">Network</span>
                <span>IP address</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">Hardware</span>
                <span>Device type, OS</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-400 text-xs uppercase tracking-widest">Logs</span>
                <span>Login activity</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "use",
      title: "3. How We Use Data",
      icon: <FaRegFileAlt />,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["Manage employee lifecycle", "Process payroll & attendance", "Provide HR analytics", "Improve system performance", "Ensure security and compliance"].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <span className="text-slate-700 font-medium">{item}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "legal",
      title: "4. Legal Basis for Processing",
      icon: <FaRegCheckCircle />,
      content: (
        <div className="space-y-4">
          {[
            { t: "Contractual Obligations", d: "Fulfilling employment contract requirements." },
            { t: "Legal Compliance", d: "Adhering to statutory labor and tax regulations." },
            { t: "Legitimate Interests", d: "Operating and improving HRMS services efficiently." }
          ].map((item, i) => (
            <div key={i} className="flex gap-6 p-6 bg-white rounded-3xl border border-slate-100">
              <div className="flex-shrink-0 w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-xl">
                <FaRegCheckCircle />
              </div>
              <div>
                <h5 className="font-bold text-slate-900 mb-1">{item.t}</h5>
                <p className="text-slate-500 text-sm leading-relaxed">{item.d}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "sharing",
      title: "5. Data Sharing",
      icon: <FaUserSecret />,
      content: (
        <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
          <div className="relative z-10">
            <h4 className="text-2xl font-bold mb-6">Strict Confidentiality</h4>
            <p className="text-slate-400 mb-8 max-w-xl">We never sell your data. Sharing occurs only with verified partners under strict NDA protocols.</p>
            <div className="flex flex-wrap gap-4">
              {["Admins", "Payroll Partners", "Vendors", "Authorities"].map((item, i) => (
                <div key={i} className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-sm font-bold">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "security",
      title: "6. Data Security",
      icon: <FaLock />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "End-to-End Encryption", desc: "Military-grade SSL/TLS protection." },
            { label: "RBAC Controls", desc: "Granular role-based access security." },
            { label: "Cloud Perimeter", desc: "Next-gen firewalled infrastructure." }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-blue-50 rounded-[32px] border border-blue-100 group hover:bg-blue-600 transition-colors duration-500">
              <h5 className="font-black text-blue-900 group-hover:text-white transition-colors">{item.label}</h5>
              <p className="text-xs text-blue-600 group-hover:text-blue-100 mt-2 transition-colors">{item.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "retention",
      title: "7. Data Retention",
      icon: <FaDatabase />,
      content: (
        <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[32px] border border-slate-200">
          <div className="hidden sm:flex flex-shrink-0 w-20 h-20 bg-white rounded-full items-center justify-center text-4xl shadow-sm text-slate-300">
            <FaClock className="animate-spin-slow" />
          </div>
          <p className="text-slate-600 leading-relaxed italic">
            "Data is retained as long as required for employment or legal obligations. We deleted securely when no longer needed."
          </p>
        </div>
      )
    },
    {
      id: "rights",
      title: "8. User Rights",
      icon: <FaRegCheckCircle />,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {["Access Data", "Request Correction", "Request Deletion"].map((item, i) => (
            <div key={i} className="p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-blue-500 hover:scale-105 transition-all text-center group">
              <span className="text-lg font-black text-slate-800 group-hover:text-blue-600">{item}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "cookies",
      title: "9. Cookies & Tracking",
      icon: <FaRegFileAlt />,
      content: "CHRISPP uses session-critical cookies for authentication and analytics. You can manage preference via browser settings."
    },
    {
      id: "thirdparty",
      title: "10. Third-Party Services",
      icon: <FaShieldAlt />,
      content: "Our ecosystem includes trusted cloud and analytics providers, all governed by strict confidentiality agreements."
    },
    {
      id: "children",
      title: "11. Children’s Privacy",
      icon: <FaLock />,
      content: "CHRISPP is strictly for professional use and not intended for individuals under 18."
    },
    {
      id: "updates",
      title: "12. Updates to Policy",
      icon: <FaRegFileAlt />,
      content: "This policy evolves with legal standards. Users will be notified of significant updates."
    },
    {
      id: "camera",
      title: "13. Camera Usage Policy",
      icon: <FaShieldAlt />,
      content: (
        <div className="space-y-6">
          <h4 className="text-xl font-bold text-slate-900">Purpose of Camera Access</h4>
          <p className="text-slate-600 leading-relaxed">
            Our app requests access to your device’s camera solely to enable core features such as:
          </p>
          <ul className="space-y-3">
            {[
              "Capturing photos or videos within the app",
              "Scanning codes, documents, or images (if applicable)",
              "Supporting user-initiated actions that require camera functionality"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-slate-600 font-medium italic p-4 bg-blue-50 rounded-2xl border border-blue-100">
            "The camera is only activated when you explicitly choose to use these features."
          </p>
        </div>
      )
    },
    {
      id: "contact",
      title: "14. Contact Information",
      icon: <FaUserSecret />,
      content: (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-10 md:p-16 text-white shadow-2xl shadow-blue-500/20">
          <h4 className="text-3xl font-black mb-8">Get in Touch</h4>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl">
                <FaMapMarkerAlt />
              </div>
              <div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Office</p>
                <p className="text-xl font-bold">Noida, U.P, India</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl">
                <FaEnvelope />
              </div>
              <div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Support</p>
                <p className="text-xl font-bold underline underline-offset-4 decoration-2">info@chrispp.au</p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-4 opacity-60">
            <img src={logo1} alt="Logo" className="h-8 brightness-0 invert" />
            <span className="font-black text-sm tracking-tighter">CHRISPP HRMS</span>
          </div>
        </div>
      )
    }
  ];

  const scrollTo = (index) => {
    sectionRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans selection:bg-blue-500 selection:text-white">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none z-0" 
           style={{ backgroundImage: `radial-gradient(#e2e8f0 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      {/* Header */}
      <header className="sticky top-0 z-[60] bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6 h-24 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => navigate("/login")}
              className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10"
            >
              <FaArrowLeft />
              <span className="font-bold text-sm">Dashboard</span>
            </button>
            <div className="flex items-center gap-3">
              <img src={logo1} alt="Logo" className="h-10 w-auto" />
              <img src={logoText} alt="CHRISPP" className="h-6 w-auto hidden sm:block" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:block text-slate-400 font-bold text-xs uppercase tracking-widest mr-4">Compliance Center</span>
            <button className="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm border border-blue-100">Privacy Policy</button>
            <button onClick={() => navigate("/terms-and-conditions")} className="px-6 py-2.5 hover:bg-slate-50 text-slate-500 rounded-xl font-bold text-sm transition-colors">Terms</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 relative z-10">
        
        {/* Left Sidebar - Navigation */}
        <aside className="lg:w-80 flex-shrink-0">
          <div className="sticky top-36">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-8 px-4">Privacy<br />Policy</h2>
            <nav className="space-y-1">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => scrollTo(index)}
                  className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 flex items-center gap-4 ${
                    activeSection === index 
                      ? "bg-white shadow-xl shadow-slate-200/60 text-blue-600 scale-105 z-10 font-bold" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                  }`}
                >
                  <span className={`text-xl ${activeSection === index ? "text-blue-500" : "text-slate-300"}`}>
                    {section.icon}
                  </span>
                  <span className="text-sm truncate">{section.title.split(". ")[1]}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-12 pb-24">
          {sections.map((section, index) => (
            <section 
              key={section.id} 
              ref={el => sectionRefs.current[index] = el}
              className={`scroll-mt-36 p-10 md:p-16 rounded-[48px] border-2 transition-all duration-700 ${
                activeSection === index 
                  ? "bg-white border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]" 
                  : "bg-transparent border-transparent opacity-40 grayscale blur-[1px]"
              }`}
            >
              <div className="max-w-3xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                    activeSection === index ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"
                  }`}>
                    {section.icon}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    {section.title}
                  </h3>
                </div>
                <div className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
                  {section.content}
                </div>
              </div>
            </section>
          ))}

          {/* Page Footer */}
          <div className="pt-20 text-center">
            <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <div className="mt-8 flex justify-center items-center gap-4 opacity-30">
              <img src={logo1} alt="Icon" className="h-8" />
              <img src={logoText} alt="Text" className="h-5" />
            </div>
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        body { scroll-behavior: smooth; }
      `}} />
    </div>
  );
};

// Internal Helper for Icon (FaClock was missing in the list above but used)
const FaClock = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8l-21.7 29.9c-3.9 5.3-11.4 6.5-16.8 2.6z"></path>
  </svg>
);

export default PrivacyPolicy;
