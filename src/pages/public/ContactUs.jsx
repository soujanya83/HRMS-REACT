import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt, FaGlobe, FaArrowLeft, FaCheck } from "react-icons/fa";
import logo1 from "../../assets/logo1.png";
import logoText from "../../assets/logotext.png";

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
    agreed: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        message: "",
        agreed: false
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-teal-500 selection:text-white">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold transition-all group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Login</span>
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <img src={logo1} alt="Logo" className="h-8 w-auto" />
              <img src={logoText} alt="CHRISPP" className="h-5 w-auto hidden sm:block" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/privacy-policy")}
              className="hidden md:block text-slate-500 hover:text-slate-900 font-bold text-sm"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => navigate("/terms-and-conditions")}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
            >
              Terms
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Left Column: Info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Talk to our <span className="text-teal-500">team</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                Questions about pricing, integrations or rollout? We'll get back within one business day.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-white shadow-xl shadow-slate-200/50 rounded-2xl flex items-center justify-center text-teal-500 text-xl group-hover:scale-110 transition-transform">
                  <FaEnvelope />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Email Support</p>
                  <a href="mailto:info@chirspp.au" className="text-xl font-bold text-slate-900 hover:text-teal-600 transition-colors">
                    info@chirspp.au
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-white shadow-xl shadow-slate-200/50 rounded-2xl flex items-center justify-center text-teal-500 text-xl group-hover:scale-110 transition-transform">
                  <FaPhoneAlt />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Call Us</p>
                  <a href="tel:+61493889880" className="text-xl font-bold text-slate-900 hover:text-teal-600 transition-colors">
                    +61 493 889 880
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-white shadow-xl shadow-slate-200/50 rounded-2xl flex items-center justify-center text-teal-500 text-xl group-hover:scale-110 transition-transform">
                  <FaGlobe />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Our Website</p>
                  <a href="https://chrispp.au" target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-slate-900 hover:text-teal-600 transition-colors">
                    chrispp.au
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-slate-100 p-8 md:p-12">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 mb-4">Contact Us</h2>
              <p className="text-slate-500 font-medium">
                Have questions or want to learn more? Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            {isSubmitted ? (
              <div className="py-12 text-center space-y-6">
                <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
                  <FaCheck />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Message Sent!</h3>
                  <p className="text-slate-500 mt-2 font-medium">Thank you for reaching out. We'll be in touch shortly.</p>
                </div>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="example@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+61 000 000 000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-bold text-slate-700 ml-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows="4"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 resize-none"
                  ></textarea>
                </div>

                <div className="flex items-start gap-3 py-2">
                  <input
                    type="checkbox"
                    id="agreed"
                    name="agreed"
                    required
                    checked={formData.agreed}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="agreed" className="text-sm font-medium text-slate-600 leading-tight">
                    I agree to the processing of my personal data for contact purposes
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 bg-[#45c2b1] hover:bg-[#39a394] text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-teal-500/20 active:scale-[0.98] flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer Decoration */}
      <footer className="mt-12 py-12 border-t border-slate-100 text-center">
        <div className="flex justify-center items-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
          <img src={logo1} alt="Icon" className="h-8" />
          <img src={logoText} alt="Text" className="h-5" />
        </div>
        <p className="mt-4 text-slate-400 text-sm font-bold tracking-widest uppercase">
          © {new Date().getFullYear()} CHRISPP HRMS. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default ContactUs;
