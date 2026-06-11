import React from 'react';
import { motion } from 'framer-motion';
import { HiPlay, HiArrowRight, HiShieldCheck, HiLightningBolt } from 'react-icons/hi';

const HeroSection = () => {
  const scrollToInquiry = () => {
    document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-mesh">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/5 to-transparent pointer-events-none"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Content Side */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center space-x-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-8"
            >
              <HiLightningBolt className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Next-Gen University ERP</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-black text-primary leading-[1.1] mb-8 tracking-tighter"
            >
              Empowering <span className="text-gradient">Education</span> <br />
              Beyond Boundaries.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-500 mb-12 max-w-xl leading-relaxed font-medium"
            >
              EntitySYS simplifies complex academic workflows into elegant digital experiences. Trusted by 100+ institutions to lead the digital revolution in education.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
            >
              <button 
                onClick={scrollToInquiry}
                className="btn-premium bg-primary text-white w-full sm:w-auto hover:bg-slate-800"
              >
                <span>Get Started</span>
                <HiArrowRight className="ml-3 text-xl" />
              </button>
              
              <button className="flex items-center space-x-4 group">
                <div className="w-14 h-14 glass rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg">
                  <HiPlay className="text-2xl" />
                </div>
                <span className="font-bold text-primary group-hover:text-secondary transition-colors">Watch Demo</span>
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-16 flex items-center justify-center lg:justify-start space-x-8 text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <HiShieldCheck className="text-2xl text-emerald-500" />
                <span className="text-sm font-bold">ISO Certified</span>
              </div>
              <div className="h-4 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-primary">4.9/5</span>
                <span className="text-xs font-bold uppercase">Rating</span>
              </div>
            </motion.div>
          </div>

          {/* Visual Side */}
          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative z-10"
            >
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white/50 glass">
                <img 
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3" 
                  alt="University Students" 
                  className="w-full h-auto object-cover hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
              </div>

              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -right-10 glass p-6 rounded-3xl shadow-2xl z-20 hidden md:block"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                    <HiShieldCheck />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enrollment</p>
                    <p className="text-xl font-black text-primary">+120% YoY</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-10 -left-10 glass p-6 rounded-3xl shadow-2xl z-20 hidden md:block"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-white text-2xl">
                    <HiLightningBolt />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Automation</p>
                    <p className="text-xl font-black text-primary">Real-time</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full blur-[120px] -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
