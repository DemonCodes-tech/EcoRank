import React from 'react';
import { motion } from 'framer-motion';
import { Theme, themes, applyTheme } from '../services/themes';
import { X, Palette, Check, Zap, Download, Monitor, Smartphone } from 'lucide-react';
import { Language, User } from '../types';
import { translations } from '../services/translations';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onThemeSelect: (theme: Theme) => void;
  lang: Language;
  currentUser?: User | null;
}

const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose, currentThemeId, onThemeSelect, lang, currentUser }) => {
  const t = translations[lang];

  if (!isOpen) return null;

  const handleSelect = (theme: Theme) => {
    applyTheme(theme);
    onThemeSelect(theme);
  };

  const downloadThemeWallpaper = async (e: React.MouseEvent, theme: Theme, type: 'desktop' | 'mobile') => {
    e.stopPropagation();
    
    const width = type === 'desktop' ? 1920 : 1080;
    const height = type === 'desktop' ? 1080 : 1920;

    if (['parrot', 'smiski'].includes(theme.id)) {
        const html2canvas = (await import('html2canvas')).default;
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
        container.className = `theme-${theme.id}`;
        container.style.backgroundColor = theme.id === 'smiski' ? '#ffffff' : theme.colors[950];
        
        Object.entries(theme.colors).forEach(([shade, value]) => {
            container.style.setProperty(`--eco-${shade}`, value);
        });

        let innerHTML = '';
        if (theme.id === 'parrot') {
            innerHTML = `
                <div class="parrot-container" style="width: 100%; height: 100%; position: relative; overflow: hidden;">
                    <div class="jungle-leaves-bg" style="animation: none !important;"></div>
                    <div class="jungle-leaves" style="animation: none !important;"></div>
                    
                    <!-- Left Tree Trunk -->
                    <div style="position: absolute; top: 0; bottom: 0; left: ${type === 'desktop' ? '5%' : '2%'}; width: ${type === 'desktop' ? '120px' : '80px'}; background-image: url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 4 16\\'%3E%3Cpath fill=\\'%2378350f\\' d=\\'M1 0h2v16H1z\\'/%3E%3Cpath fill=\\'%23451a03\\' d=\\'M3 0h1v16H3z\\'/%3E%3Cpath fill=\\'%2392400e\\' d=\\'M0 0h1v16H0z\\'/%3E%3C/svg%3E'); background-size: ${type === 'desktop' ? '48px 192px' : '32px 128px'}; image-rendering: pixelated; z-index: 2; box-shadow: 10px 0 20px rgba(0,0,0,0.5);"></div>
                    
                    <!-- Right Tree Trunk -->
                    <div style="position: absolute; top: 0; bottom: 0; right: ${type === 'desktop' ? '8%' : '2%'}; width: ${type === 'desktop' ? '160px' : '100px'}; background-image: url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 4 16\\'%3E%3Cpath fill=\\'%2378350f\\' d=\\'M1 0h2v16H1z\\'/%3E%3Cpath fill=\\'%23451a03\\' d=\\'M3 0h1v16H3z\\'/%3E%3Cpath fill=\\'%2392400e\\' d=\\'M0 0h1v16H0z\\'/%3E%3C/svg%3E'); background-size: ${type === 'desktop' ? '64px 256px' : '40px 160px'}; image-rendering: pixelated; z-index: 1; box-shadow: -10px 0 20px rgba(0,0,0,0.5);"></div>
                    
                    <!-- Hanging Vines -->
                    <div style="position: absolute; top: 0; left: 25%; width: 30px; height: 50%; background-image: url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 16 16\\'%3E%3Cpath fill=\\'%2315803d\\' d=\\'M7 0h2v16H7z\\'/%3E%3Cpath fill=\\'%2322c55e\\' d=\\'M5 4h2v2H5z M9 8h2v2H9z M5 12h2v2H5z\\'/%3E%3C/svg%3E'); background-size: 30px 30px; image-rendering: pixelated; z-index: 3;"></div>
                    <div style="position: absolute; top: 0; left: 60%; width: 40px; height: 70%; background-image: url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 16 16\\'%3E%3Cpath fill=\\'%2315803d\\' d=\\'M7 0h2v16H7z\\'/%3E%3Cpath fill=\\'%2322c55e\\' d=\\'M5 4h2v2H5z M9 8h2v2H9z M5 12h2v2H5z\\'/%3E%3C/svg%3E'); background-size: 40px 40px; image-rendering: pixelated; z-index: 2;"></div>
                    <div style="position: absolute; top: 0; right: 35%; width: 25px; height: 40%; background-image: url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 16 16\\'%3E%3Cpath fill=\\'%2315803d\\' d=\\'M7 0h2v16H7z\\'/%3E%3Cpath fill=\\'%2322c55e\\' d=\\'M5 4h2v2H5z M9 8h2v2H9z M5 12h2v2H5z\\'/%3E%3C/svg%3E'); background-size: 25px 25px; image-rendering: pixelated; z-index: 3;"></div>

                    <div class="foreground-branch"></div>
                    <div class="pixel-macaw macaw-1" style="animation: none !important; top: ${type === 'desktop' ? '30%' : '40%'}; left: ${type === 'desktop' ? '30%' : '20%'}; transform: scale(${type === 'desktop' ? '1.5' : '1.2'});"></div>
                </div>
            `;
        } else if (theme.id === 'smiski') {
            innerHTML = `
                <div class="smiski-container" style="width: 100%; height: 100%; position: relative; overflow: hidden;">
                    <div class="smiski-figure smiski-headphones" style="animation: none !important;"></div>
                    <div class="smiski-figure smiski-hula" style="animation: none !important;"></div>
                    <div class="smiski-figure smiski-laptop" style="animation: none !important;"></div>
                    <div class="smiski-figure smiski-skate" style="animation: none !important;"></div>
                    <div class="smiski-figure smiski-lotus" style="animation: none !important;"></div>
                </div>
            `;
        } else if (theme.id === 'pixel-cat') {
            innerHTML = `
                <div class="pixel-cat-container" style="width: 100%; height: 100%; position: relative; overflow: hidden; background: radial-gradient(circle at center, #334155 0%, #0f172a 100%);">
                    <div class="pixel-cat-figure" style="animation: none !important;"></div>
                    <div class="pixel-yarn yarn-1" style="animation: none !important; transform: rotate(45deg);"></div>
                    <div class="pixel-yarn yarn-2" style="animation: none !important; transform: scale(0.7) rotate(120deg);"></div>
                    <div class="pixel-yarn yarn-3" style="animation: none !important; transform: scale(1.2) rotate(-30deg);"></div>
                    <div class="pixel-mouse mouse-1" style="animation: none !important; left: 10%;"></div>
                    <div class="pixel-mouse mouse-2" style="animation: none !important; right: 10%; transform: scaleX(-1);"></div>
                    <div class="pixel-fish fish-1" style="animation: none !important; left: 20%; top: 20%;"></div>
                    <div class="pixel-fish fish-2" style="animation: none !important; right: 20%; top: 40%; transform: scaleX(-1);"></div>
                </div>
            `;
        }

        innerHTML += `
            <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="position: absolute; bottom: 60px; left: 60px; color: ${theme.id === 'smiski' ? '#33691e' : (theme.colors[400] || '#ffffff')}; font-size: 48px; font-weight: bold; font-family: Inter, system-ui, sans-serif;">#EcoRank</div>
            </div>
        `;
        
        container.innerHTML = innerHTML;
        document.body.appendChild(container);

        try {
            const canvas = await html2canvas(container, {
                width,
                height,
                scale: 1,
                useCORS: true,
                backgroundColor: theme.id === 'smiski' ? '#ffffff' : theme.colors[950],
                logging: false
            });
            
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `EcoRank-${theme.name.replace(/\s+/g, '-')}-${type}-Wallpaper.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Failed to generate wallpaper", err);
        } finally {
            document.body.removeChild(container);
        }
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (theme.id === 'pixel') {
        const WATER_BASE = '#3a5a65';
        const WATER_HIGHLIGHT = '#4b6e79';
        const LILY_PAD_LIGHT = '#8ab060';
        const LILY_PAD_DARK = '#4d6932';
        const FLOWER_PINK = '#ffb7c5';
        const FLOWER_WHITE = '#ffffff';
        const FLOWER_YELLOW = '#fde047';
        const FLOWER_PURPLE = '#a78bfa';
        const FROG_GREEN = '#4ade80';
        const FROG_DARK = '#15803d';
        const FLY_COLOR = '#e5e7eb';
        const DRAGONFLY_BODY = '#38bdf8';
        const DRAGONFLY_WING = '#e0f2fe';

        const scale = 4;
        const w = Math.ceil(width / scale);
        const h = Math.ceil(height / scale);

        ctx.fillStyle = WATER_BASE;
        ctx.fillRect(0, 0, width, height);

        ctx.scale(scale, scale);

        // Draw Ripples
        ctx.fillStyle = WATER_HIGHLIGHT;
        for (let i = 0; i < 30; i++) {
            const rx = Math.random() * w;
            const ry = Math.random() * h;
            const rw = 4 + Math.random() * 10;
            ctx.fillRect(Math.floor(rx), Math.floor(ry), Math.floor(rw), 1);
        }

        const drawPixelCircle = (cx: number, cy: number, r: number, color: string) => {
            ctx.fillStyle = color;
            for (let y = -r; y <= r; y++) {
                for (let x = -r; x <= r; x++) {
                    if (x*x + y*y <= r*r) {
                        ctx.fillRect(Math.floor(cx + x), Math.floor(cy + y), 1, 1);
                    }
                }
            }
        };

        const drawFrog = (x: number, y: number) => {
            ctx.fillStyle = FROG_GREEN;
            ctx.fillRect(x - 2, y - 2, 5, 4);
            ctx.fillStyle = FROG_DARK;
            ctx.fillRect(x - 2, y - 3, 1, 1);
            ctx.fillRect(x + 2, y - 3, 1, 1);
            ctx.fillStyle = FROG_GREEN;
            ctx.fillRect(x - 3, y, 1, 2);
            ctx.fillRect(x + 3, y, 1, 2);
        };

        const drawLilyPad = (x: number, y: number, size: number) => {
            drawPixelCircle(x, y, size, LILY_PAD_LIGHT);
            drawPixelCircle(x, y, size - 2, LILY_PAD_DARK);
            drawPixelCircle(x, y, size - 3, LILY_PAD_LIGHT);
            ctx.fillStyle = WATER_BASE;
            ctx.fillRect(x, y, size, size);
        };

        const drawFlower = (x: number, y: number, size: number, color: string) => {
            drawPixelCircle(x - 2, y, 2, color);
            drawPixelCircle(x + 2, y, 2, color);
            drawPixelCircle(x, y - 2, 2, color);
            drawPixelCircle(x, y + 2, 2, color);
            drawPixelCircle(x, y, 1, '#fff090');
        };

        const drawFly = (x: number, y: number) => {
            ctx.fillStyle = FLY_COLOR;
            ctx.fillRect(x, y, 1, 1);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(x - 1, y - 1, 1, 1);
            ctx.fillRect(x + 1, y - 1, 1, 1);
        };

        const drawDragonfly = (x: number, y: number) => {
            ctx.fillStyle = DRAGONFLY_BODY;
            ctx.fillRect(x, y, 1, 5);
            ctx.fillRect(x - 1, y + 1, 3, 1);
            ctx.fillStyle = DRAGONFLY_WING;
            ctx.fillRect(x - 3, y + 1, 2, 1);
            ctx.fillRect(x + 2, y + 1, 2, 1);
            ctx.fillRect(x - 3, y + 3, 2, 1);
            ctx.fillRect(x + 2, y + 3, 2, 1);
        };

        // Generate Lily Pads
        const numPads = Math.floor((w * h) / 2000);
        const elements: any[] = [];
        for (let i = 0; i < numPads; i++) {
            const hasFrog = Math.random() > 0.8;
            elements.push({
                type: 'pad',
                x: Math.random() * w,
                y: Math.random() * h,
                size: 5 + Math.random() * 8,
                flower: !hasFrog && Math.random() > 0.6 ? (Math.random() > 0.5 ? 'pink' : 'white') : null,
                frog: hasFrog
            });
        }

        // Generate Floating Flowers
        const numFlowers = Math.floor(numPads / 3);
        for (let i = 0; i < numFlowers; i++) {
            elements.push({
                type: 'lotus',
                x: Math.random() * w,
                y: Math.random() * h,
                size: 3 + Math.random() * 3,
                color: Math.random() > 0.5 ? FLOWER_YELLOW : FLOWER_PURPLE
            });
        }

        // Generate Flies
        for (let i = 0; i < 15; i++) {
            elements.push({ type: 'fly', x: Math.random() * w, y: Math.random() * h });
        }

        // Generate Dragonflies
        for (let i = 0; i < 8; i++) {
            elements.push({ type: 'dragonfly', x: Math.random() * w, y: Math.random() * h });
        }

        elements.sort((a, b) => a.y - b.y);

        elements.forEach(el => {
            if (el.type === 'pad') {
                drawLilyPad(el.x, el.y, el.size);
                if (el.frog) drawFrog(el.x, el.y);
                else if (el.flower) drawFlower(el.x, el.y, 3, el.flower === 'pink' ? FLOWER_PINK : FLOWER_WHITE);
            } else if (el.type === 'lotus') {
                drawFlower(el.x, el.y, el.size, el.color);
            } else if (el.type === 'fly') {
                drawFly(el.x, el.y);
            } else if (el.type === 'dragonfly') {
                drawDragonfly(el.x, el.y);
            }
        });

        // Draw Wisteria
        const vineX = w - 40;
        for (let i = 0; i < 15; i++) {
            let x = vineX + (i * 5) + Math.sin(i) * 2;
            let len = 20 + Math.random() * 40;
            ctx.fillStyle = '#4d6932';
            ctx.fillRect(x, 0, 1, len);
            for (let j = 0; j < len; j+=2) {
                if (Math.random() > 0.3) {
                    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#e9d5ff';
                    ctx.fillRect(x - 1 + Math.random()*2, j, 2, 1);
                }
            }
        }

        // Reset scale for text
        ctx.scale(1/scale, 1/scale);
    } else {
        // Background
        ctx.fillStyle = theme.colors[950] || '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Decorative gradient
        const gradient = ctx.createRadialGradient(
          canvas.width * 0.8, canvas.height * 0.2, 0,
          canvas.width * 0.8, canvas.height * 0.2, Math.max(width, height) * 0.8
        );
        // Convert hex to rgba for opacity
        const hexToRgba = (hex: string, alpha: number) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        
        try {
            gradient.addColorStop(0, hexToRgba(theme.colors[500], 0.5));
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } catch (e) {
            // Fallback if color parsing fails
            ctx.fillStyle = theme.colors[500];
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(canvas.width * 0.8, canvas.height * 0.2, Math.max(width, height) * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    // #EcoRank on bottom left
    ctx.fillStyle = theme.colors[400] || '#ffffff';
    ctx.font = 'bold 48px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('#EcoRank', 60, canvas.height - 60);

    // Trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `EcoRank-${theme.name.replace(/\s+/g, '-')}-${type}-Wallpaper.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            boxShadow: ['0 0 20px -5px var(--eco-500)', '0 0 60px -15px var(--eco-500)', '0 0 20px -5px var(--eco-500)']
        }}
        transition={{
            boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            default: { duration: 0.3, ease: "easeOut" }
        }}
        className="w-full max-w-5xl h-auto max-h-[90vh] bg-[#0a0a0a] border border-eco-500/30 relative overflow-hidden rounded-3xl flex flex-col"
        style={{ borderColor: 'var(--eco-500)' }}
      >
        
        {/* Header */}
        <div className="bg-white/5 border-b border-white/5 p-6 flex items-center justify-between flex-shrink-0 relative z-10 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-eco-500/10 rounded-2xl border border-eco-500/20">
                 <Palette className="h-6 w-6 text-eco-500" />
            </div>
            <div>
                <span className="text-lg font-bold text-white block">{t.themeSelector}</span>
                <span className="text-xs text-eco-400">12 Presets Available</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {themes.filter(theme => {
                    if (theme.id === 'pixel-cat') {
                        return currentUser?.name.toLowerCase() === 'laya';
                    }
                    return true;
                }).map((theme) => {
                    const isActive = currentThemeId === theme.id;
                    return (
                        <div
                            key={theme.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelect(theme)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleSelect(theme);
                                }
                            }}
                            className={`group relative h-48 rounded-2xl border-2 transition-all duration-300 text-left flex flex-col justify-end overflow-hidden hover:scale-[1.02] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                                isActive 
                                ? 'border-white shadow-xl' 
                                : 'border-transparent hover:border-white/20'
                            }`}
                            style={{
                                backgroundColor: theme.colors[950]
                            }}
                        >
                            {/* Decorative Glow */}
                            <div 
                                className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-40 transition-opacity group-hover:opacity-60"
                                style={{ backgroundColor: theme.colors[500] }}
                            ></div>
                            
                            {isActive && (
                                <div className="absolute top-4 right-4 p-1.5 bg-white text-black rounded-full shadow-lg z-20">
                                    <Check className="h-4 w-4 stroke-[3]" />
                                </div>
                            )}

                            {/* Download Buttons */}
                            <div className="absolute top-4 left-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => downloadThemeWallpaper(e, theme, 'desktop')}
                                    className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
                                    aria-label={`Download ${theme.name} desktop wallpaper`}
                                    title={`Download ${theme.name} desktop wallpaper`}
                                >
                                    <Monitor className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => downloadThemeWallpaper(e, theme, 'mobile')}
                                    className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
                                    aria-label={`Download ${theme.name} mobile wallpaper`}
                                    title={`Download ${theme.name} mobile wallpaper`}
                                >
                                    <Smartphone className="h-4 w-4" />
                                </button>
                            </div>
                            
                            {/* Content */}
                            <div className="relative z-10 p-5 w-full bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center gap-3 mb-2">
                                    <div 
                                        className={`w-3 h-3 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                                        style={{ backgroundColor: theme.colors[400], boxShadow: `0 0 10px ${theme.colors[500]}` }}
                                    ></div>
                                    <span 
                                        className="text-sm font-bold text-white group-hover:text-white/90"
                                    >
                                        {theme.name}
                                    </span>
                                </div>
                                <div className="flex gap-1.5 h-2 w-full mt-2 rounded-full overflow-hidden opacity-80">
                                    <div className="flex-1" style={{ backgroundColor: theme.colors[400] }}></div>
                                    <div className="flex-1" style={{ backgroundColor: theme.colors[500] }}></div>
                                    <div className="flex-1" style={{ backgroundColor: theme.colors[600] }}></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-2">
                 <Zap className="h-4 w-4 text-eco-500" />
                 <span>UI Version 2.4</span>
            </div>
            <span>Select a preset to apply</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ThemeModal;