import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';
import { HelpCircle, ChevronDown, ChevronUp, Leaf, Trophy, Camera, Zap, Star } from 'lucide-react';

interface FAQProps {
  lang: Language;
}

export default function FAQ({ lang }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const isAr = lang === 'ar';

  const faqs = [
    {
      question: isAr ? 'كيف يعمل نظام EcoRank؟' : 'How does EcoRank work?',
      answer: isAr 
        ? 'EcoRank هو تطبيق يتتبع نشاطاتك البيئية. يمكنك التقاط صور لأفعالك المستدامة (مثل إعادة التدوير، استخدام أكياس قابلة لإعادة الاستخدام)، وسيقوم الذكاء الاصطناعي الخاص بنا بتحليل الصورة، والتحقق من الإجراء، ومنحك نقاطاً بناءً على التأثير البيئي.'
        : 'EcoRank is an app that tracks your eco-friendly activities. You take photos of your sustainable actions (like recycling, using reusable bags), and our AI analyzes the image, verifies the action, and awards you points based on the environmental impact.',
      icon: <Leaf className="h-5 w-5 text-eco-500" />
    },
    {
      question: isAr ? 'كيف يتم حساب النقاط؟' : 'How are points calculated?',
      answer: isAr 
        ? 'يتم حساب النقاط بواسطة الذكاء الاصطناعي بناءً على عدة عوامل: نوع الإجراء، الجهد المبذول، والتأثير البيئي الإجمالي. على سبيل المثال، إعادة تدوير زجاجة بلاستيكية قد تمنحك 5 نقاط، بينما زراعة شجرة قد تمنحك 50 نقطة.'
        : 'Points are calculated by our AI based on several factors: the type of action, the effort required, and the overall environmental impact. For example, recycling a plastic bottle might earn 5 points, while planting a tree could earn 50 points.',
      icon: <Star className="h-5 w-5 text-yellow-500" />
    },
    {
      question: isAr ? 'ما هي سلسلة الأيام (Streak)؟' : 'What is a Streak?',
      answer: isAr 
        ? 'سلسلة الأيام هي عدد الأيام المتتالية التي قمت فيها بتسجيل إجراء بيئي واحد على الأقل. الحفاظ على سلسلة أيامك يساعدك على بناء عادات مستدامة.'
        : 'A streak is the number of consecutive days you have logged at least one eco-friendly action. Maintaining your streak helps build sustainable habits.',
      icon: <Zap className="h-5 w-5 text-orange-500" />
    },
    {
      question: isAr ? 'لماذا تم رفض صورتي؟' : 'Why was my photo rejected?',
      answer: isAr 
        ? 'قد يتم رفض الصور إذا لم تكن واضحة، أو إذا لم يتمكن الذكاء الاصطناعي من التحقق من الإجراء البيئي، أو إذا تم اكتشاف محاولة غش (مثل استخدام صورة من الإنترنت أو تكرار نفس الصورة). تأكد من أن صورك واضحة وتظهر الإجراء الفعلي.'
        : 'Photos might be rejected if they are blurry, if the AI cannot verify the eco-friendly action, or if cheating is detected (like using a stock photo or submitting the exact same image twice). Ensure your photos clearly show the action taking place.',
      icon: <Camera className="h-5 w-5 text-blue-500" />
    },
    {
      question: isAr ? 'كيف يمكنني التنافس مع الآخرين؟' : 'How do I compete with others?',
      answer: isAr 
        ? 'يمكنك رؤية ترتيبك في صفحة "الترتيب" (Leaderboard). يتم ترتيب المستخدمين بناءً على إجمالي النقاط التي جمعوها. تنافس مع زملائك للوصول إلى المركز الأول!'
        : 'You can see your ranking on the Leaderboard page. Users are ranked based on their total accumulated points. Compete with your classmates to reach the top spot!',
      icon: <Trophy className="h-5 w-5 text-purple-500" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-eco-500/20 rounded-xl">
          <HelpCircle className="h-8 w-8 text-eco-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-gray-400 mt-1">
            {isAr ? 'كل ما تحتاج لمعرفته حول EcoRank' : 'Everything you need to know about EcoRank'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-eco-900/30 border border-eco-500/20 rounded-2xl overflow-hidden backdrop-blur-sm"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-500"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/5 rounded-lg shrink-0">
                  {faq.icon}
                </div>
                <span className="text-lg font-medium text-white">{faq.question}</span>
              </div>
              <div className="shrink-0 ml-4">
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-eco-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>
            
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-6 pt-2 text-gray-300 leading-relaxed border-t border-white/5 mx-6">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-900/20 border border-blue-500/20 rounded-2xl text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          {isAr ? 'هل لا زلت بحاجة للمساعدة؟' : 'Still need help?'}
        </h3>
        <p className="text-gray-400 mb-4">
          {isAr ? 'إذا لم تجد إجابتك هنا، يمكنك التواصل معنا.' : "If you couldn't find your answer here, feel free to reach out."}
        </p>
        <button 
          onClick={() => window.location.href = 'mailto:wadeesshaat@gmail.com'}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
        >
          {isAr ? 'اتصل بالدعم' : 'Contact Support'}
        </button>
      </div>
    </div>
  );
}
