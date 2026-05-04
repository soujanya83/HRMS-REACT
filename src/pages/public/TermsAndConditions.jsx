import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaGavel, FaArrowLeft, FaRegHandshake, FaUserShield, FaExclamationTriangle, FaBan, FaCheckCircle, FaGlobe, FaBalanceScale, FaClock, FaHandshake, FaRegHandshake as FaHandshakeIcon, FaMapMarkerAlt, FaEnvelope, FaUserSecret } from "react-icons/fa";
import logo1 from "../../assets/logo1.png";
import logoText from "../../assets/logotext.png";

const TermsAndConditions = () => {
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
      icon: <FaHandshakeIcon />,
      content: "These Terms & Conditions govern access to and use of the HRMS platform (“Platform”) operated by CHRISPP (“Company”, “we”, “our”, “us”). By accessing or using the Platform (web or mobile), you agree to comply with these Terms."
    },
    {
      id: "eligibility",
      title: "2. Eligibility",
      icon: <FaUserShield />,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-8 bg-blue-50 rounded-[32px] border border-blue-100 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm text-xl">
              <FaCheckCircle />
            </div>
            <p className="text-blue-900 font-black text-lg">Authorized Personnel Only</p>
            <p className="text-blue-700/70 text-sm">Valid employees, contractors, or verified clients.</p>
          </div>
          <div className="p-8 bg-slate-900 rounded-[32px] border border-slate-800 flex flex-col gap-4 text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white text-xl">
              <FaClock />
            </div>
            <p className="font-black text-lg">Minimum Age 18+</p>
            <p className="text-slate-400 text-sm">Or legally permitted to use professional HR systems.</p>
          </div>
        </div>
      )
    },
    {
      id: "accounts",
      title: "3. User Accounts",
      icon: <FaUserShield />,
      content: (
        <div className="space-y-4">
          {[
            { t: "Confidentiality", d: "Users are responsible for maintaining confidentiality of login credentials." },
            { t: "Accountability", d: "Any activity under your account is your responsibility." },
            { t: "Security Reporting", d: "Unauthorized access must be reported immediately." }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-6 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
              <div>
                <h5 className="font-black text-slate-900 mb-1">{item.t}</h5>
                <p className="text-slate-500 text-sm leading-relaxed">{item.d}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "usage",
      title: "4. Use of Platform",
      icon: <FaCheckCircle />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-4">Authorized Uses</h4>
            {["Employee management", "Attendance & Payroll", "Internal communication"].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900 font-bold">
                <FaCheckCircle className="text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-rose-600 mb-4">Prohibited Acts</h4>
            {["Misuse data / Unauthorized access", "Uploading harmful malware", "Hacking or reverse engineering"].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-900 font-bold">
                <FaBan className="text-rose-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "ownership",
      title: "5. Data Ownership",
      icon: <FaBalanceScale />,
      content: (
        <div className="relative p-10 bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200 text-center">
          <p className="text-slate-600 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            Employee data belongs to the respective organization. <br/>
            <span className="text-blue-600 font-black">CHRISPP</span> acts as a data processor and does not claim ownership.
          </p>
        </div>
      )
    },
    {
      id: "ip",
      title: "6. Intellectual Property",
      icon: <FaGavel />,
      content: (
        <div className="bg-slate-900 rounded-[40px] p-10 text-white flex flex-col md:flex-row gap-10 items-center">
           <div className="w-32 h-32 flex-shrink-0 bg-white/5 rounded-full flex items-center justify-center text-5xl">
              <FaGavel className="opacity-40" />
           </div>
           <div>
              <p className="text-slate-400 leading-relaxed text-lg">
                All software, UI, design, and content are owned by <span className="text-white font-bold tracking-tighter">CHRISPP</span>. 
                No copying, distribution, or modification without explicit permission.
              </p>
           </div>
        </div>
      )
    },
    {
      id: "availability",
      title: "7. Service Availability",
      icon: <FaGlobe />,
      content: "We aim for high uptime but do not guarantee uninterrupted service. Maintenance or downtime may occur periodically."
    },
    {
      id: "termination",
      title: "8. Termination",
      icon: <FaBan />,
      content: (
        <div className="p-8 bg-rose-50 rounded-[32px] border border-rose-100">
          <p className="text-rose-900 font-bold text-lg mb-4">We may suspend or terminate access if:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-rose-700">
            <li className="flex items-center gap-2">• Terms are violated</li>
            <li className="flex items-center gap-2">• Misuse detected</li>
            <li className="flex items-center gap-2">• Security threats</li>
          </ul>
        </div>
      )
    },
    {
      id: "liability",
      title: "9. Limitation of Liability",
      icon: <FaExclamationTriangle />,
      content: "We are not liable for indirect damages, data loss, or business interruption. Liability is limited to fees paid (if applicable)."
    },
    {
      id: "law",
      title: "10. Governing Law",
      icon: <FaBalanceScale />,
      content: (
        <div className="flex flex-col sm:flex-row gap-4">
           <div className="flex-1 p-8 bg-white border border-slate-100 rounded-3xl text-center">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Legal Base</p>
              <p className="text-xl font-black text-slate-900">Laws of India</p>
           </div>
           <div className="flex-1 p-8 bg-white border border-slate-100 rounded-3xl text-center">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Jurisdiction</p>
              <p className="text-xl font-black text-slate-900">Courts of Noida</p>
           </div>
        </div>
      )
    },
    {
      id: "changes",
      title: "11. Changes to Terms",
      icon: <FaClock />,
      content: "We may update Terms anytime. Continued use means acceptance."
    },
    {
      id: "contact",
      title: "12. Contact Information",
      icon: <FaUserSecret />,
      content: (
        <div className="bg-slate-900 rounded-[40px] p-10 md:p-16 text-white shadow-2xl">
          <h4 className="text-3xl font-black mb-8">Get in Touch</h4>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl text-white">
                <FaMapMarkerAlt />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Office</p>
                <p className="text-xl font-bold">Noida, U.P, India</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl text-white">
                <FaEnvelope />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Support</p>
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
    <div className="min-h-screen bg-[#f1f5f9] font-sans selection:bg-slate-900 selection:text-white">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none z-0" 
           style={{ backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`, backgroundSize: '48px 48px' }}></div>

      {/* Header */}
      <header className="sticky top-0 z-[60] bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6 h-24 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => navigate("/login")}
              className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
            >
              <FaArrowLeft />
              <span className="font-bold text-sm">Return</span>
            </button>
            <div className="flex items-center gap-3">
              <img src={logo1} alt="Logo" className="h-10 w-auto" />
              <img src={logoText} alt="CHRISPP" className="h-6 w-auto hidden sm:block" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/privacy-policy")} className="px-6 py-2.5 hover:bg-slate-50 text-slate-500 rounded-xl font-bold text-sm transition-colors">Privacy</button>
            <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm">Terms of Service</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 relative z-10">
        
        {/* Left Sidebar - Navigation */}
        <aside className="lg:w-80 flex-shrink-0">
          <div className="sticky top-36">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-8 px-4">Legal<br />Terms</h2>
            <nav className="space-y-1">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => scrollTo(index)}
                  className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 flex items-center gap-4 ${
                    activeSection === index 
                      ? "bg-slate-900 shadow-2xl shadow-slate-900/20 text-white scale-105 z-10 font-bold" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                  }`}
                >
                  <span className={`text-xl ${activeSection === index ? "text-white" : "text-slate-300"}`}>
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
                    activeSection === index ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-400"
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
            <div className="flex justify-center items-center gap-4 opacity-30 mb-4">
              <img src={logo1} alt="Icon" className="h-8" />
              <img src={logoText} alt="Text" className="h-5" />
            </div>
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
              &copy; {new Date().getFullYear()} CHRISPP. All rights reserved.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TermsAndConditions;
