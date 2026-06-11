import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  HiOutlineAcademicCap, 
  HiOutlineUserGroup, 
  HiOutlineLibrary, 
  HiOutlineBriefcase, 
  HiOutlineOfficeBuilding, 
  HiOutlineLightningBolt,
  HiArrowRight
} from 'react-icons/hi';

const Counter = ({ value, suffix = "", duration = 2 }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (isInView) {
      // Extract number from value string if it contains non-numeric chars
      const numericValue = parseInt(value.toString().replace(/[^0-9]/g, ''));
      if (isNaN(numericValue)) {
        setCount(value); // If not a number, just show the string (fixes NaN issue)
        return;
      }

      let start = 0;
      const end = numericValue;
      let totalMiliseconds = duration * 1000;
      let incrementTime = (totalMiliseconds / end);

      let timer = setInterval(() => {
        start += Math.ceil(end / 100);
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, incrementTime > 10 ? incrementTime : 10);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  const displayValue = typeof count === 'number' ? count.toLocaleString() : count;
  return <span ref={nodeRef}>{displayValue}{suffix}</span>;
};

const FeatureCard = ({ icon: Icon, title, description, link, count, suffix, index, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-[2.5rem] shadow-xl group-hover:shadow-2xl transition-all duration-500"></div>
      <div className={`absolute -inset-px bg-gradient-to-br ${color} rounded-[2.5rem] opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
      
      <div className="relative p-10 flex flex-col h-full">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500 bg-gradient-to-br ${color} text-white`}>
          <Icon className="text-3xl" />
        </div>
        
        <div className="mb-4">
          <h3 className="text-4xl font-black text-primary mb-1 tracking-tighter">
            <Counter value={count} suffix={suffix} />
          </h3>
          <h4 className="text-lg font-bold text-gray-400 uppercase tracking-widest">{title}</h4>
        </div>

        <p className="text-gray-500 leading-relaxed mb-8 flex-1 font-medium">
          {description}
        </p>
        
        <a 
          href={link} 
          className="inline-flex items-center space-x-2 font-bold text-primary group-hover:text-secondary transition-colors"
        >
          <span>Explore Details</span>
          <HiArrowRight className="transform group-hover:translate-x-2 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
};

const FeatureCards = () => {
  const features = [
    {
      icon: HiOutlineAcademicCap,
      count: "10000",
      suffix: "+",
      title: "Active Students",
      description: "Driving digital excellence and personalized learning pathways for every student.",
      link: "/students",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: HiOutlineUserGroup,
      count: "500",
      suffix: "+",
      title: "Faculty Experts",
      description: "Empowering educators with world-class administrative and research tools.",
      link: "/faculty",
      color: "from-purple-500 to-pink-400"
    },
    {
      icon: HiOutlineLightningBolt,
      count: "Smart",
      suffix: "",
      title: "AI Administration",
      description: "Automated decision-making and real-time analytics for modern governance.",
      link: "/admin-demo",
      color: "from-emerald-500 to-teal-400"
    },
    {
      icon: HiOutlineOfficeBuilding,
      count: "5",
      suffix: "+",
      title: "Regional Campuses",
      description: "Connected infrastructure ensuring unified experiences across all locations.",
      link: "/campuses",
      color: "from-amber-500 to-orange-400"
    },
    {
      icon: HiOutlineLibrary,
      count: "50",
      suffix: "+",
      title: "Programs",
      description: "Diverse academic portfolio spanning UG, PG, and specialized research.",
      link: "/courses",
      color: "from-indigo-500 to-blue-400"
    },
    {
      icon: HiOutlineBriefcase,
      count: "95",
      suffix: "%",
      title: "Placement Rate",
      description: "Strategic partnerships with industry leaders for global career opportunities.",
      link: "/placements",
      color: "from-rose-500 to-red-400"
    }
  ];

  return (
    <section className="section-padding bg-slate-50 relative overflow-hidden" id="features">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/50 rounded-full blur-[100px] -ml-48 -mb-48"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-20">
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-secondary font-black uppercase tracking-widest text-sm mb-4"
          >
            Institutional Impact
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-tight"
          >
            Measuring Success through <br />
            <span className="text-gradient">Real-world Data.</span>
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
