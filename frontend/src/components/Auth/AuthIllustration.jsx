import React from 'react';

/**
 * High-fidelity, self-contained SVG illustration for Auth pages.
 * Resolves external image loading failures and provides crisp, theme-harmonized vectors.
 * @param {'register' | 'login' | 'forgot' | 'reset' | 'verify'} type - The illustration variant
 */
const AuthIllustration = ({ type = 'register' }) => {
    if (type === 'login') {
        return (
            <svg
                viewBox="0 0 420 320"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-md h-auto drop-shadow-2xl select-none"
            >
                <defs>
                    <radialGradient id="loginGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.85" />
                    </linearGradient>
                    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0f172a" />
                        <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fde047" />
                        <stop offset="100%" stopColor="#eab308" />
                    </linearGradient>
                    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
                    </linearGradient>
                </defs>

                {/* Ambient Glow & Base Shadow */}
                <circle cx="210" cy="160" r="140" fill="url(#loginGlow)" />
                <ellipse cx="210" cy="265" rx="150" ry="20" fill="black" fillOpacity="0.18" />

                {/* Laptop Base */}
                <path
                    d="M100 240 L320 240 C328 240 334 245 330 252 L315 258 C312 260 305 261 298 261 L122 261 C115 261 108 260 105 258 L90 252 C86 245 92 240 100 240 Z"
                    fill="url(#laptopGrad)"
                />
                <rect x="180" y="242" width="60" height="4" rx="2" fill="#cbd5e1" />

                {/* Laptop Screen Body */}
                <rect x="125" y="105" width="170" height="135" rx="12" fill="url(#laptopGrad)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                <rect x="133" y="113" width="154" height="118" rx="8" fill="url(#screenGrad)" />

                {/* Screen Content - University Portal Dashboard */}
                <rect x="145" y="125" width="40" height="5" rx="2.5" fill="#38bdf8" />
                <rect x="145" y="135" width="80" height="3" rx="1.5" fill="#64748b" />
                <rect x="145" y="142" width="60" height="3" rx="1.5" fill="#475569" />

                {/* Chart Bars on Screen */}
                <rect x="145" y="195" width="12" height="25" rx="3" fill="#38bdf8" fillOpacity="0.8" />
                <rect x="163" y="180" width="12" height="40" rx="3" fill="#818cf8" fillOpacity="0.8" />
                <rect x="181" y="165" width="12" height="55" rx="3" fill="#c084fc" fillOpacity="0.8" />
                <rect x="199" y="172" width="12" height="48" rx="3" fill="#34d399" fillOpacity="0.8" />

                {/* Circular Gauge on Screen */}
                <circle cx="255" cy="180" r="20" stroke="#334155" strokeWidth="4" fill="none" />
                <circle cx="255" cy="180" r="20" stroke="#38bdf8" strokeWidth="4" strokeDasharray="90 120" strokeLinecap="round" fill="none" />
                <circle cx="255" cy="180" r="5" fill="#38bdf8" />

                {/* Floating Card: User Verified Badge (Left) */}
                <g className="animate-float" style={{ animationDuration: '5s' }}>
                    <rect x="35" y="120" width="115" height="54" rx="16" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <circle cx="62" cy="147" r="15" fill="#34d399" />
                    {/* Checkmark inside circle */}
                    <path d="M56 147 L60 151 L68 143" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="85" y="140" width="50" height="5" rx="2.5" fill="#ffffff" />
                    <rect x="85" y="149" width="34" height="4" rx="2" fill="#e2e8f0" fillOpacity="0.8" />
                </g>

                {/* Floating Card: Graduation Degree (Right) */}
                <g className="animate-float" style={{ animationDuration: '6s', animationDelay: '1s' }}>
                    <rect x="275" y="70" width="115" height="60" rx="16" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <circle cx="305" cy="100" r="16" fill="url(#goldGrad)" />
                    {/* Star icon inside circle */}
                    <path d="M305 92 L307 98 L313 99 L308 103 L310 109 L305 105 L300 109 L302 103 L297 99 L303 98 Z" fill="#ffffff" />
                    <rect x="328" y="93" width="46" height="5" rx="2.5" fill="#ffffff" />
                    <rect x="328" y="102" width="30" height="4" rx="2" fill="#fde047" />
                </g>

                {/* Floating Sparkles & Accents */}
                <path d="M210 50 L213 60 L223 63 L213 66 L210 76 L207 66 L197 63 L207 60 Z" fill="#fde047" />
                <path d="M85 75 L87 82 L94 84 L87 86 L85 93 L83 86 L76 84 L83 82 Z" fill="#38bdf8" />
                <circle cx="340" cy="190" r="4" fill="#ffffff" fillOpacity="0.7" />
                <circle cx="70" cy="220" r="5" fill="#fde047" fillOpacity="0.8" />
            </svg>
        );
    }

    if (type === 'forgot' || type === 'reset') {
        return (
            <svg
                viewBox="0 0 420 320"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-md h-auto drop-shadow-2xl select-none"
            >
                <defs>
                    <radialGradient id="secGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>
                    <linearGradient id="keyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fde047" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient id="secGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
                    </linearGradient>
                </defs>

                {/* Glow & Base */}
                <circle cx="210" cy="160" r="140" fill="url(#secGlow)" />
                <ellipse cx="210" cy="265" rx="140" ry="18" fill="black" fillOpacity="0.2" />

                {/* Main Security Shield */}
                <path
                    d="M210 70 Q280 85 295 120 Q300 200 210 245 Q120 200 125 120 Q140 85 210 70 Z"
                    fill="url(#shieldGrad)"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="3"
                />

                {/* Inner Shield Accent */}
                <path
                    d="M210 88 Q265 100 276 130 Q280 190 210 228 Q140 190 144 130 Q155 100 210 88 Z"
                    fill="#0f172a"
                    fillOpacity="0.85"
                />

                {/* Lock Shackle & Body inside Shield */}
                <path
                    d="M190 150 L190 135 C190 123 200 115 210 115 C220 115 230 123 230 135 L230 150"
                    stroke="url(#keyGrad)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    fill="none"
                />
                <rect x="178" y="146" width="64" height="48" rx="12" fill="url(#keyGrad)" />
                <circle cx="210" cy="166" r="5" fill="#0f172a" />
                <path d="M210 171 L210 182" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />

                {/* Floating Golden Key */}
                <g className="animate-float" style={{ animationDuration: '5.5s' }}>
                    <circle cx="100" cy="110" r="18" stroke="url(#keyGrad)" strokeWidth="6" fill="none" />
                    <path d="M115 119 L155 155 L162 148 L154 140 L160 134" stroke="url(#keyGrad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>

                {/* Floating Security Badge (Right) */}
                <g className="animate-float" style={{ animationDuration: '6s', animationDelay: '1.2s' }}>
                    <rect x="280" y="160" width="110" height="52" rx="16" fill="url(#secGlass)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <circle cx="304" cy="186" r="12" fill="#38bdf8" />
                    <path d="M299 186 L303 190 L309 183" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="324" y="180" width="48" height="4" rx="2" fill="#ffffff" />
                    <rect x="324" y="188" width="32" height="3" rx="1.5" fill="#93c5fd" />
                </g>

                {/* Sparkles */}
                <path d="M210 40 L213 50 L223 53 L213 56 L210 66 L207 56 L197 53 L207 50 Z" fill="#fde047" />
                <path d="M330 90 L332 96 L338 98 L332 100 L330 106 L328 100 L322 98 L328 96 Z" fill="#38bdf8" />
            </svg>
        );
    }

    if (type === 'verify') {
        return (
            <svg
                viewBox="0 0 420 320"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-md h-auto drop-shadow-2xl select-none"
            >
                <defs>
                    <radialGradient id="verGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#f1f5f9" />
                    </linearGradient>
                    <linearGradient id="verGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
                    </linearGradient>
                </defs>

                <circle cx="210" cy="160" r="140" fill="url(#verGlow)" />
                <ellipse cx="210" cy="265" rx="140" ry="18" fill="black" fillOpacity="0.18" />

                {/* Central Verification Terminal Card */}
                <rect x="120" y="80" width="180" height="175" rx="24" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
                
                {/* Shield Circle Header */}
                <circle cx="210" cy="130" r="32" fill="#3b82f6" />
                <path d="M198 130 L206 138 L222 122" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                {/* 6-Digit OTP Slots */}
                <rect x="142" y="180" width="20" height="24" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                <circle cx="152" cy="192" r="3.5" fill="#0f172a" />

                <rect x="167" y="180" width="20" height="24" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                <circle cx="177" cy="192" r="3.5" fill="#0f172a" />

                <rect x="192" y="180" width="20" height="24" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                <circle cx="202" cy="192" r="3.5" fill="#0f172a" />

                <rect x="217" y="180" width="20" height="24" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                <circle cx="227" cy="192" r="3.5" fill="#0f172a" />

                <rect x="242" y="180" width="20" height="24" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                <circle cx="252" cy="192" r="3.5" fill="#0f172a" />

                <rect x="267" y="180" width="20" height="24" rx="6" fill="#f8fafc" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="277" cy="192" r="3.5" fill="#3b82f6" />

                {/* Button Mockup */}
                <rect x="145" y="218" width="130" height="20" rx="8" fill="#0f172a" />
                <rect x="185" y="226" width="50" height="4" rx="2" fill="#ffffff" />

                {/* Floating Email Envelopes */}
                <g className="animate-float" style={{ animationDuration: '5s' }}>
                    <rect x="40" y="95" width="65" height="46" rx="12" fill="url(#verGlass)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <path d="M48 106 L72 122 L96 106" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </g>

                <g className="animate-float" style={{ animationDuration: '6s', animationDelay: '1s' }}>
                    <rect x="315" y="145" width="65" height="46" rx="12" fill="url(#verGlass)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                    <path d="M323 156 L347 172 L371 156" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </g>

                {/* Sparkles */}
                <path d="M210 40 L213 50 L223 53 L213 56 L210 66 L207 56 L197 53 L207 50 Z" fill="#fde047" />
            </svg>
        );
    }

    // Default: 'register' - Academic Journey & Launch
    return (
        <svg
            viewBox="0 0 420 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-md h-auto drop-shadow-2xl select-none"
        >
            <defs>
                <radialGradient id="regGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <linearGradient id="tasselGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
                <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient id="regGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="blueRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
            </defs>

            {/* Ambient Background Glow */}
            <circle cx="210" cy="155" r="145" fill="url(#regGlow)" />
            <ellipse cx="210" cy="270" rx="150" ry="20" fill="black" fillOpacity="0.2" />

            {/* Base Pedestal Platform */}
            <ellipse cx="210" cy="245" rx="120" ry="24" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <ellipse cx="210" cy="235" rx="95" ry="18" fill="rgba(255,255,255,0.22)" />

            {/* Centerpiece: Academic Graduation Mortarboard (3D Angle) */}
            {/* Skullcap (Underneath) */}
            <path
                d="M160 145 C160 185 260 185 260 145 L260 162 C260 198 160 198 160 162 Z"
                fill="#0f172a"
                fillOpacity="0.9"
            />

            {/* Diamond Board (Top Cap) */}
            <polygon
                points="210,85 320,128 210,170 100,128"
                fill="url(#capGrad)"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
            />
            {/* Inner polygon shading */}
            <polygon
                points="210,95 305,130 210,162 115,130"
                fill="#f8fafc"
                fillOpacity="0.5"
            />

            {/* Cap Button & Tassel */}
            <circle cx="210" cy="128" r="6" fill="url(#tasselGold)" />
            <path
                d="M210 128 Q250 135 270 165 L270 185"
                stroke="url(#tasselGold)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
            />
            {/* Tassel Fringe */}
            <polygon points="266,185 274,185 278,208 262,208" fill="url(#tasselGold)" />

            {/* Diploma Scroll (Resting in front) */}
            <g transform="translate(145, 195) rotate(-8)">
                <rect x="0" y="0" width="130" height="26" rx="13" fill="url(#scrollGrad)" stroke="#ffffff" strokeWidth="1.5" />
                <rect x="52" y="-2" width="22" height="30" rx="4" fill="url(#blueRibbon)" />
                <circle cx="63" cy="28" r="5" fill="#fde047" />
            </g>

            {/* Floating Glassmorphic Badge: Student Portal (Left) */}
            <g className="animate-float" style={{ animationDuration: '5.5s' }}>
                <rect x="30" y="85" width="125" height="58" rx="18" fill="url(#regGlass)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                <circle cx="58" cy="114" r="16" fill="#38bdf8" />
                {/* User/Student icon in circle */}
                <circle cx="58" cy="109" r="6" fill="#ffffff" />
                <path d="M48 123 C48 118 53 117 58 117 C63 117 68 118 68 123" fill="#ffffff" />
                <rect x="84" y="106" width="56" height="5" rx="2.5" fill="#ffffff" />
                <rect x="84" y="116" width="38" height="4" rx="2" fill="#93c5fd" />
            </g>

            {/* Floating Glassmorphic Badge: Verified Admission (Right) */}
            <g className="animate-float" style={{ animationDuration: '6s', animationDelay: '1.2s' }}>
                <rect x="270" y="145" width="125" height="58" rx="18" fill="url(#regGlass)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                <circle cx="298" cy="174" r="16" fill="#34d399" />
                {/* Checkmark icon in circle */}
                <path d="M292 174 L296 178 L304 170" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="324" y="166" width="56" height="5" rx="2.5" fill="#ffffff" />
                <rect x="324" y="176" width="36" height="4" rx="2" fill="#86efac" />
            </g>

            {/* Golden & Blue Ambient Stars/Sparkles */}
            <path d="M210 35 L213 46 L224 49 L213 52 L210 63 L207 52 L196 49 L207 46 Z" fill="#fde047" />
            <path d="M330 65 L332 72 L339 74 L332 76 L330 83 L328 76 L321 74 L328 72 Z" fill="#38bdf8" />
            <path d="M70 190 L72 195 L77 197 L72 199 L70 204 L68 199 L63 197 L68 195 Z" fill="#fde047" />
            <circle cx="110" cy="50" r="4" fill="#ffffff" fillOpacity="0.7" />
            <circle cx="340" cy="225" r="5" fill="#ffffff" fillOpacity="0.8" />
        </svg>
    );
};

export default AuthIllustration;
