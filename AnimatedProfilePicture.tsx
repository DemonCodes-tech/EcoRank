import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnimatedProfilePictureProps {
  profilePicture?: string;
  borderType?: 'none' | 'cat' | 'snake' | 'pixel-cat' | 'pixel-snake';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  themeId?: string;
}

const AnimatedProfilePicture: React.FC<AnimatedProfilePictureProps> = ({ 
  profilePicture, 
  borderType = 'none', 
  size = 'md',
  className = '',
  themeId = 'matrix'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Theme-based colors
  const themeColors: Record<string, string> = {
    matrix: '#10b981',
    cyberpunk: '#d946ef',
    oceanic: '#06b6d4',
    crimson: '#ef4444',
    voltage: '#eab308',
    royal: '#8b5cf6',
    toxic: '#84cc16',
    obsidian: '#71717a',
    sunset: '#f97316',
    azure: '#0ea5e9',
    nebula: '#ec4899',
    indigo: '#6366f1',
    pixel: '#ec4899',
    'pixel-cat': '#f59e0b',
    parrot: '#ef4444',
    smiski: '#c5e1a5'
  };

  const activeColor = themeColors[themeId] || '#10b981';

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Animated Borders */}
      
      {(borderType === 'pixel-cat' || borderType === 'cat') && (
        <div className="absolute -inset-5 pointer-events-none z-10">
          <motion.div
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 12, // Slower, more graceful rotation
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                y: [0, -6, 0], // Gentler bounce
                rotate: [-8, 8, -8] // Gentler wiggle
              }}
              transition={{
                duration: 1.2, // Slower, more natural movement
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12"
            >
              <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-lg">
                <path fill="#f8fafc" d="M10 6h2v2h-2z M20 6h2v2h-2z" />
                <path fill="#94a3b8" d="M8 8h16v12H8z" /> {/* Gray body */}
                <path fill="#475569" d="M6 10h2v10H6z M24 10h2v10h-2z" />
                <path fill="#f59e0b" d="M11 12h3v3h-3z M18 12h3v3h-3z" />
                <path fill="#0f172a" d="M12 13h1v1h-1z M19 13h1v1h-1z" />
                <path fill="#f472b6" d="M15 16h2v1h-2z" />
                <path fill="#94a3b8" d="M10 20h3v4h-3z M19 20h3v4h-3z" /> {/* Gray legs */}
                <motion.path 
                  fill="#475569" 
                  d="M26 12h4v8h-4z"
                  animate={{ rotate: [0, 30, 0] }} // Gentler tail wag
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  style={{ originX: "26px", originY: "16px" }}
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      )}

      {(borderType === 'pixel-snake' || borderType === 'snake') && (
        <div className="absolute -inset-4 pointer-events-none z-10">
          <motion.div
            animate={{
              rotate: -360
            }}
            transition={{
              duration: 8, // Slower rotation for the path
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0"
          >
            <motion.div
              animate={{
                scaleX: [1, 1.5, 0.8, 1.3, 1], // More varied stretch
                scaleY: [1, 0.7, 1.2, 0.8, 1], // Added vertical stretch
                x: [-6, 6, -4, 4, -6], // More horizontal movement
                y: [-2, 2, -1, 1, -2], // Added vertical "wave" movement
                rotate: [-5, 5, -3, 3, -5] // Added slight body rotation
              }}
              transition={{
                duration: 0.4, // Slightly slower for more complex slither
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-8"
            >
              <svg viewBox="0 0 32 16" className="w-full h-full drop-shadow-lg">
                <path fill={activeColor} d="M4 6h20v4H4z" />
                <path fill="#16a34a" d="M4 10h20v1H4z" />
                <path fill="#000000" d="M22 7h1v1h-1z M22 9h1v1h-1z" />
                <path fill="#ef4444" d="M24 8h4v1h-4z" />
                <path fill="#15803d" d="M8 6h2v4H8z M16 6h2v4h-2z" />
                <motion.path 
                  fill={activeColor} 
                  d="M2 8h2v1H2z"
                  animate={{ x: [-4, 4, -4], scaleX: [1, 2, 1] }} // More tongue movement
                  transition={{ duration: 0.15, repeat: Infinity }}
                />
              </svg>
            </motion.div>
          </motion.div>
          <div className="absolute inset-2 border-2 border-emerald-500/20 rounded-full" style={{ borderColor: `${activeColor}33` }} />
        </div>
      )}

      {/* Main PFP Container */}
      <div className={`relative w-full h-full rounded-full overflow-hidden bg-black/40 border-2 ${borderType !== 'none' ? 'border-transparent' : 'border-eco-500/30'} flex items-center justify-center z-0`}>
        {profilePicture ? (
          <img 
            src={profilePicture} 
            alt="Profile" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <UserIcon className={`${iconSizes[size]} text-gray-500`} />
        )}
      </div>
    </div>
  );
};

export default AnimatedProfilePicture;
