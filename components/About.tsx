import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Cpu, ShieldCheck, Zap, Globe, Code, Database, Eye, Star } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../services/translations';

interface AboutProps {
  lang: Language;
}

const About: React.FC<AboutProps> = ({ lang }) => {
  const t = translations[lang];

  const features = [
    {
      icon: Eye,
      title: lang === 'en' ? 'AI Vision Analysis' : 'تحليل الرؤية بالذكاء الاصطناعي',
      desc: lang === 'en' 
        ? 'Uses advanced computer vision to verify eco-friendly actions in real-time.' 
        : 'يستخدم رؤية حاسوبية متقدمة للتحقق من الإجراءات الصديقة للبيئة في الوقت الفعلي.'
    },
    {
      icon: ShieldCheck,
      title: lang === 'en' ? 'Anti-Cheat System' : 'نظام مكافحة الغش',
      desc: lang === 'en'
        ? 'Multi-layer verification protocols ensure authenticity of every submission.'
        : 'بروتوكولات تحقق متعددة الطبقات تضمن مصداقية كل مشاركة.'
    },
    {
      icon: Database,
      title: lang === 'en' ? 'Secure Logging' : 'سجل آمن',
      desc: lang === 'en'
        ? 'Encrypted database stores all user actions and points securely.'
        : 'قاعدة بيانات مشفرة تخزن جميع إجراءات المستخدم والنقاط بشكل آمن.'
    },
    {
      icon: Zap,
      title: lang === 'en' ? 'Real-time Scoring' : 'تسجيل النقاط في الوقت الفعلي',
      desc: lang === 'en'
        ? 'Instant feedback and point allocation powered by Gemini AI.'
        : 'تغذية راجعة فورية وتخصيص النقاط مدعوم بواسطة Gemini AI.'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-eco-500/10 rounded-full mb-4">
          <Terminal className="w-8 h-8 text-eco-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          {lang === 'en' ? 'System Architecture' : 'هندسة النظام'}
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
          {lang === 'en' 
            ? 'EcoRank is a next-generation gamified sustainability platform designed to incentivize and verify eco-friendly behaviors using artificial intelligence.'
            : 'EcoRank هي منصة استدامة مبنية على الألعاب من الجيل التالي مصممة لتحفيز والتحقق من السلوكيات الصديقة للبيئة باستخدام الذكاء الاصطناعي.'}
        </p>
      </div>

      {/* Team Section */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
            <ShieldCheck className="w-6 h-6 text-eco-500" />
            {lang === 'en' ? 'Command Center' : 'مركز القيادة'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Admins */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-white/10 pb-2 mb-4">
                    {lang === 'en' ? 'System Admins' : 'مسؤولي النظام'}
                </h3>
                
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold">D</div>
                    <div>
                        <div className="text-white font-bold text-sm">Demon <span className="text-xs text-gray-500 ml-2">Wadeea</span></div>
                        <div className="text-xs text-red-400">Root Access • Lead Dev</div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-pink-500/5 p-3 rounded-2xl border border-pink-500/10 hover:bg-pink-500/10 transition-all">
                    <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 font-bold">🦋</div>
                    <div>
                        <div className="text-pink-500 font-bold text-sm">Eshel <span className="text-xs text-pink-400 ml-2">🦋</span></div>
                        <div className="text-xs text-pink-400">System Admin • Ops</div>
                    </div>
                </div>
            </div>

            {/* Points System Architect */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-white/10 pb-2 mb-4">
                    {lang === 'en' ? 'Points System Architect' : 'مهندس نظام النقاط'}
                </h3>
                <div className="flex items-center gap-4 bg-fuchsia-500/5 p-3 rounded-2xl border border-fuchsia-500/10 hover:bg-fuchsia-500/10 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400 font-bold group-hover:bg-fuchsia-500/20 transition-colors">Y</div>
                    <div>
                        <div className="text-fuchsia-400 font-bold text-sm">Mi_Tax <span className="text-xs text-fuchsia-500/70 ml-2">Yousef</span></div>
                        <div className="text-xs text-fuchsia-500">Lead Economist • Balancing</div>
                    </div>
                </div>
            </div>

            {/* Design & Media Team */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-white/10 pb-2 mb-4">
                    {lang === 'en' ? 'Design & Media' : 'التصميم والإعلام'}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-4 bg-violet-500/5 p-3 rounded-2xl border border-violet-500/10 hover:bg-violet-500/10 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold group-hover:bg-violet-500/20">R</div>
                        <div>
                            <div className="text-violet-400 font-bold text-sm">Rere <span className="text-xs text-violet-500/70 ml-2">Raheeg</span></div>
                            <div className="text-xs text-violet-500">Head of Design</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-yellow-500/5 p-3 rounded-2xl border border-yellow-500/10 hover:bg-yellow-500/10 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400 font-bold group-hover:bg-yellow-500/20">🪼</div>
                        <div>
                            <div className="text-yellow-400 font-bold text-sm">🪼 <span className="text-xs text-yellow-500/70 ml-2">Yarah</span></div>
                            <div className="text-xs text-yellow-500">Head of Media</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-rose-500/5 p-3 rounded-2xl border border-rose-500/10 hover:bg-rose-500/10 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold group-hover:bg-rose-500/20">K</div>
                        <div>
                            <div className="text-rose-400 font-bold text-sm">Vanilla Frost <span className="text-xs text-rose-500/70 ml-2">Kenzy</span></div>
                            <div className="text-xs text-rose-500">Media Assistant</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Moderators */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-white/10 pb-2 mb-4">
                    {lang === 'en' ? 'Moderators' : 'المشرفين'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { name: "Laya", grade: "" },
                        { name: "Sara Omar", grade: "12", color: "mint" },
                        { name: "Besan", nickname: "Baby Boo", grade: "9", color: "hot_pink" },
                        { name: "Batoul", grade: "11" },
                        { name: "Jana Z.", nickname: "Janjoon", grade: "9", color: "purple" },
                        { name: "Malak Nawaisaaa", nickname: "Mimi", grade: "12", color: "wine" },
                        { name: "Cyrine", grade: "9" },
                        { name: "Malak L.", grade: "9" },
                        { name: "Jana Amir", grade: "12" },
                        { name: "Rahaf", nickname: "Ruee", grade: "9", color: "blue" }
                    ].map((mod, i) => {
                        const color = (mod as any).color;
                        
                        let containerClass = "bg-white/5 border-white/5 hover:bg-white/10";
                        let avatarClass = "bg-white/10 text-gray-300";
                        let nameClass = "text-gray-200";
                        let subtextClass = "text-gray-500";
                        let badgeClass = "bg-white/10 text-gray-400";

                        if (color === 'wine') {
                            containerClass = "bg-red-900/10 border-red-900/20 hover:bg-red-900/20";
                            avatarClass = "bg-red-900/20 text-red-300";
                            nameClass = "text-red-200";
                            subtextClass = "text-red-400";
                            badgeClass = "bg-red-900/20 text-red-200";
                        } else if (color === 'purple') {
                            containerClass = "bg-purple-900/10 border-purple-900/20 hover:bg-purple-900/20";
                            avatarClass = "bg-purple-900/20 text-purple-300";
                            nameClass = "text-purple-200";
                            subtextClass = "text-purple-400";
                            badgeClass = "bg-purple-900/20 text-purple-200";
                        } else if (color === 'blue') {
                            containerClass = "bg-blue-900/10 border-blue-900/20 hover:bg-blue-900/20";
                            avatarClass = "bg-blue-900/20 text-blue-300";
                            nameClass = "text-blue-200";
                            subtextClass = "text-blue-400";
                            badgeClass = "bg-blue-900/20 text-blue-200";
                        } else if (color === 'hot_pink') {
                            containerClass = "bg-pink-900/10 border-pink-900/20 hover:bg-pink-900/20";
                            avatarClass = "bg-pink-900/20 text-pink-300";
                            nameClass = "text-pink-200";
                            subtextClass = "text-pink-400";
                            badgeClass = "bg-pink-900/20 text-pink-200";
                        } else if (color === 'mint') {
                            containerClass = "bg-emerald-900/10 border-emerald-900/20 hover:bg-emerald-900/20";
                            avatarClass = "bg-emerald-900/20 text-emerald-300";
                            nameClass = "text-emerald-200";
                            subtextClass = "text-emerald-400";
                            badgeClass = "bg-emerald-900/20 text-emerald-200";
                        }

                        return (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${containerClass}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${avatarClass}`}>
                                {mod.nickname ? mod.nickname[0] : mod.name[0]}
                            </div>
                            <div>
                                <div className={`${nameClass} font-bold text-xs flex items-center gap-2`}>
                                    {mod.nickname ? mod.nickname : mod.name}
                                    {mod.grade && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${badgeClass}`}>{mod.grade}</span>}
                                </div>
                                <div className={`text-[10px] uppercase tracking-wide ${subtextClass}`}>
                                    {mod.nickname ? `Real Name: ${mod.name}` : 'Moderator'}
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            </div>
        </div>
      </div>

      {/* Core Technology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                <feature.icon className="w-6 h-6 text-eco-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* How it Works Section */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Code className="w-5 h-5 text-eco-500" />
          {lang === 'en' ? 'Scoring Algorithm' : 'خوارزمية النقاط'}
        </h2>
        
        <div className="space-y-6 relative z-10">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-eco-500/10 flex items-center justify-center text-eco-500 font-bold">1</div>
            <div>
              <h4 className="text-white font-bold mb-1">{lang === 'en' ? 'Action Capture' : 'التقاط الإجراء'}</h4>
              <p className="text-sm text-gray-400">
                {lang === 'en' 
                  ? 'User captures photo/video evidence of an eco-friendly action.'
                  : 'يقوم المستخدم بالتقاط صورة/فيديو كدليل على إجراء صديق للبيئة.'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-eco-500/10 flex items-center justify-center text-eco-500 font-bold">2</div>
            <div>
              <h4 className="text-white font-bold mb-1">{lang === 'en' ? 'AI Analysis' : 'تحليل الذكاء الاصطناعي'}</h4>
              <p className="text-sm text-gray-400">
                {lang === 'en'
                  ? 'Gemini 3.1 Pro processes the visual data to identify the action, verify authenticity, and categorize the impact.'
                  : 'يقوم Gemini 3.1 Pro بمعالجة البيانات المرئية لتحديد الإجراء، والتحقق من المصداقية، وتصنيف التأثير.'}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-eco-500/10 flex items-center justify-center text-eco-500 font-bold">3</div>
            <div>
              <h4 className="text-white font-bold mb-1">{lang === 'en' ? 'Point Allocation' : 'تخصيص النقاط'}</h4>
              <p className="text-sm text-gray-400">
                {lang === 'en'
                  ? 'Points are awarded based on difficulty, impact, and creativity. Streaks multiply the rewards.'
                  : 'يتم منح النقاط بناءً على الصعوبة والتأثير والإبداع. التتابع يضاعف المكافآت.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Scoring Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                {lang === 'en' ? 'Point Values' : 'قيم النقاط'}
            </h3>
            <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-400">{lang === 'en' ? 'Verified Action' : 'إجراء تم التحقق منه'}</span>
                    <span className="text-eco-400 font-bold">+10 PTS</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-400">{lang === 'en' ? 'Rare Item Recycle' : 'إعادة تدوير عنصر نادر'}</span>
                    <span className="text-eco-400 font-bold">+20 PTS</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-400">{lang === 'en' ? 'Community Cleanup' : 'تنظيف مجتمعي'}</span>
                    <span className="text-eco-400 font-bold">+50 PTS</span>
                </li>
                <li className="flex justify-between items-center pt-1">
                    <span className="text-red-400">{lang === 'en' ? 'Rejected/Fake' : 'مرفوض/مزيف'}</span>
                    <span className="text-red-500 font-bold">0 PTS</span>
                </li>
            </ul>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400" />
                {lang === 'en' ? 'Streak Multipliers' : 'مضاعفات التتابع'}
            </h3>
            <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-400">{lang === 'en' ? '3 Day Streak' : 'تتابع 3 أيام'}</span>
                    <span className="text-orange-400 font-bold">1.2x {lang === 'en' ? 'Multiplier' : 'مضاعف'}</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-400">{lang === 'en' ? '7 Day Streak' : 'تتابع 7 أيام'}</span>
                    <span className="text-orange-400 font-bold">1.5x {lang === 'en' ? 'Multiplier' : 'مضاعف'}</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-400">{lang === 'en' ? '30 Day Streak' : 'تتابع 30 يوماً'}</span>
                    <span className="text-orange-400 font-bold">2.0x {lang === 'en' ? 'Multiplier' : 'مضاعف'}</span>
                </li>
                <li className="flex justify-between items-center pt-1">
                    <span className="text-red-400">{lang === 'en' ? 'Missed Day' : 'يوم فائت'}</span>
                    <span className="text-red-500 font-bold">{lang === 'en' ? 'RESET TO 0' : 'إعادة تعيين للصفر'}</span>
                </li>
            </ul>
        </div>
      </div>

      {/* Ranks Section */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              {lang === 'en' ? 'Ranks & Levels' : 'الرتب والمستويات'}
          </h3>
          <div className="space-y-3">
              {[
                  { name: lang === 'en' ? 'Beginner sprout 🌱' : 'برعم مبتدئ 🌱', points: 100 },
                  { name: lang === 'en' ? 'Street saver' : 'منقذ الشوارع', points: 230 },
                  { name: lang === 'en' ? 'pollution eliminator 🚮' : 'مزيل التلوث 🚮', points: 450 },
                  { name: lang === 'en' ? 'Garbage detective 🕵️‍♀️' : 'محقق القمامة 🕵️‍♀️', points: 670 },
                  { name: lang === 'en' ? 'Eco pro' : 'محترف بيئي', points: 1500 }
              ].map((rank, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                      <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-eco-500/10 flex items-center justify-center text-eco-400 text-xs font-bold">
                              {idx + 1}
                          </div>
                          <span className="text-gray-300 text-sm">{rank.name}</span>
                      </div>
                      <span className="text-eco-400 font-bold text-sm">{rank.points} PTS</span>
                  </div>
              ))}
          </div>
      </div>

      {/* Footer / Credits */}
      <div className="text-center pt-8 border-t border-white/5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
          {lang === 'en' ? 'Developed By' : 'تطوير'}
        </p>
        <div className="flex justify-center gap-4 text-sm text-gray-400 font-medium">
          <span>Wadeea</span>
        </div>
        <p className="text-[10px] text-gray-600 mt-4">
          Version 1.0.0
        </p>
        <p className="text-[10px] text-gray-500 mt-2">
          {(t as any).copyright}
        </p>
      </div>
    </motion.div>
  );
};

export default About;
