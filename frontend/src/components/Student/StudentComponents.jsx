import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export const ComingSoonBadge = () => (
    <span className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black border border-amber-200 shadow-sm z-10">
        COMING SOON
    </span>
);

export const FeatureCard = ({ icon: Icon, title, description, link, comingSoon, extra }) => {
    const handleClick = (e) => {
        if (comingSoon) {
            e.preventDefault();
            toast('This feature will be available soon!', {
                icon: '⏳',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
        }
    };

    return (
        <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative p-6 bg-white rounded-3xl shadow-md border border-gray-100 group transition-all hover:shadow-xl flex flex-col h-full"
        >
            {comingSoon && <ComingSoonBadge />}
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-secondary">
                <Icon className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight">{title}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{description}</p>

            {extra && <div className="mb-4">{extra}</div>}

            <Link
                to={link}
                onClick={handleClick}
                className="inline-flex items-center text-secondary font-black text-sm hover:gap-3 transition-all mt-auto"
            >
                {comingSoon ? 'Learn More' : 'Access Now'} <ExternalLink className="ml-1 h-4 w-4" />
            </Link>
        </motion.div>
    );
};

export const NoticeSkeleton = () => (
    <div className="p-5 bg-white rounded-2xl border border-gray-100 mb-4 animate-pulse">
        <div className="flex justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
);
