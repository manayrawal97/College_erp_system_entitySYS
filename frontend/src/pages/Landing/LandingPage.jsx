import React, { useEffect } from 'react';
import Navbar from '../../components/Landing/Navbar';
import HeroSection from '../../components/Landing/HeroSection';
import DropdownMenu from '../../components/Landing/DropdownMenu';
import FeatureCards from '../../components/Landing/FeatureCards';
import InquiryForm from '../../components/Landing/InquiryForm';
import Footer from '../../components/Landing/Footer';

const LandingPage = () => {
 useEffect(() => {
 window.scrollTo(0, 0);
 }, []);

 return (
 <div className="relative overflow-hidden">
 <Navbar />
 <main>
 <HeroSection />
 <DropdownMenu />
 <div id="features">
 <FeatureCards />
 </div>
 <div id="inquiry">
 <InquiryForm />
 </div>
 </main>
 <Footer />
 </div>
 );
};

export default LandingPage;
