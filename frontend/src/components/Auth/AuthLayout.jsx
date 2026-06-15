import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle, illustration }) => {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] overflow-hidden">
            {/* Left Side: Illustration & Branding (Hidden on mobile banner-style) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-premium p-12 flex-col justify-between relative overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-black text-secondary">E</span>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">EntitySYS</span>
                    </div>
                </motion.div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.img
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        src={illustration}
                        alt="Illustration"
                        className="w-full max-w-md h-auto mb-12 animate-float"
                    />
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-4xl xl:text-5xl font-extrabold text-white mb-6 leading-tight"
                    >
                        {title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg text-white/80 max-w-md mx-auto"
                    >
                        {subtitle}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="relative z-10 text-white/60 text-sm flex justify-between"
                >
                    <span>© 2026 EntitySYS ERP</span>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                    </div>
                </motion.div>
            </div>

            {/* Mobile Illustration Banner */}
            <div className="lg:hidden w-full bg-gradient-premium p-6 flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold text-secondary">E</span>
                    </div>
                    <span className="text-xl font-bold text-white">EntitySYS</span>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />
                <div className="relative z-10 w-full flex justify-center">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
