import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiArrowRight, HiOutlineSparkles } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const menuData = [
  {
    title: "About",
    icon: "🏛️",
    items: ["Our Heritage", "Mission & Vision", "Leadership", "Sustainability"]
  },
  {
    title: "Organisation",
    icon: "🏢",
    items: ["Academic Schools", "Administration", "Governance", "Resources"]
  },
  {
    title: "Student Life",
    icon: "🎓",
    items: ["Campus Hub", "Clubs & Sports", "Housing", "Wellness"]
  },
  {
    title: "Admissions",
    icon: "✨",
    items: ["Undergraduate", "Graduate", "Financial Aid", "Visit Campus"]
  }
];

const DropdownMenu = () => {
  const [activeMenu, setActiveMenu] = useState(null);

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-[80px] z-40 hidden lg:block shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-1">
          <ul className="flex space-x-2">
            {menuData.map((menu, index) => (
              <li 
                key={index}
                className="relative"
                onMouseEnter={() => setActiveMenu(index)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className={`flex items-center space-x-2 px-6 py-5 font-bold text-sm tracking-widest uppercase transition-all duration-300 ${activeMenu === index ? 'text-secondary' : 'text-primary/60 hover:text-primary'}`}>
                  <span className="text-lg">{menu.icon}</span>
                  <span>{menu.title}</span>
                  <HiChevronDown className={`transition-transform duration-300 ${activeMenu === index ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeMenu === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 w-80 bg-white shadow-[0_20px_50px_rgba(8,112,184,0.1)] rounded-b-[2rem] border-t-4 border-secondary p-6 grid grid-cols-1 gap-2"
                    >
                      <div className="mb-4 pb-4 border-b border-slate-50">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center">
                          <HiOutlineSparkles className="mr-2 text-secondary" />
                          Featured Sections
                        </p>
                      </div>
                      {menu.items.map((item, i) => (
                        <Link
                          key={i}
                          to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                          className="px-4 py-3 text-slate-600 hover:text-secondary hover:bg-slate-50 rounded-xl transition-all font-bold flex items-center justify-between group/item"
                        >
                          <span>{item}</span>
                          <HiArrowRight className="opacity-0 group-hover/item:opacity-100 transform translate-x-[-10px] group-hover/item:translate-x-0 transition-all" />
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
          
          <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Admissions Open 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropdownMenu;
