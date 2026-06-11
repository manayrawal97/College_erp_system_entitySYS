import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaInstagram, 
  FaYoutube, 
  FaGithub,
  FaChevronUp,
} from 'react-icons/fa';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiArrowRight } from 'react-icons/hi';

const Footer = () => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) setShowScroll(true);
      else if (showScroll && window.pageYOffset <= 400) setShowScroll(false);
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary text-white pt-32 pb-12 relative overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-accent to-secondary"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          
          {/* Brand Column */}
          <div className="space-y-8">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary font-black text-2xl shadow-xl transform -rotate-3">
                E
              </div>
              <span className="text-3xl font-black tracking-tighter">EntitySYS</span>
            </Link>
            <p className="text-gray-400 font-medium leading-relaxed">
              Redefining university management with intelligent automation and human-centric design.
            </p>
            <div className="flex space-x-4">
              {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaGithub].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 glass-dark rounded-xl flex items-center justify-center hover:bg-secondary hover:text-white transition-all transform hover:-translate-y-1">
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-secondary mb-10">Platform</h4>
            <ul className="space-y-4">
              {['About Us', 'Solutions', 'Success Stories', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-gray-400 hover:text-white transition-colors font-bold flex items-center group">
                    <HiArrowRight className="w-0 group-hover:w-4 opacity-0 group-hover:opacity-100 transition-all mr-0 group-hover:mr-2 text-secondary" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-secondary mb-10">Headquarters</h4>
            <ul className="space-y-6">
              <li className="flex items-start space-x-4">
                <HiOutlineLocationMarker className="text-2xl text-accent flex-shrink-0" />
                <span className="text-gray-400 font-bold">123 Tech Hub, Silicon Valley of India, Bangalore - 560001</span>
              </li>
              <li className="flex items-center space-x-4">
                <HiOutlinePhone className="text-2xl text-accent flex-shrink-0" />
                <span className="text-gray-400 font-bold">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-4">
                <HiOutlineMail className="text-2xl text-accent flex-shrink-0" />
                <span className="text-gray-400 font-bold">connect@entitysys.edu</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-secondary mb-10">Stay Informed</h4>
            <p className="text-gray-400 font-bold mb-6">Get the latest institutional updates.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="email@university.edu"
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl py-4 px-6 outline-none focus:border-secondary transition-all font-bold"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-secondary px-4 rounded-xl hover:bg-blue-600 transition-colors">
                <HiArrowRight className="text-xl" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs font-black uppercase tracking-widest text-gray-500">
          <p>© 2024 ENTITY SYSTEMS. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center space-x-8 mt-6 md:mt-0">
            <span className="hover:text-white cursor-pointer transition-colors">Sitemap</span>
            <span className="hover:text-white cursor-pointer transition-colors">Cookies</span>
            <span className="text-gray-700">|</span>
            <span className="text-white">India</span>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      <button 
        onClick={scrollTop}
        className={`fixed bottom-10 right-10 z-50 w-14 h-14 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 transform ${showScroll ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
      >
        <FaChevronUp className="text-xl" />
      </button>
    </footer>
  );
};

export default Footer;
