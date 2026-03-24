import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, AppView, Language } from '../types';
import { translations } from '../services/translations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ArrowRight, Lightbulb, GripVertical, LayoutDashboard, Check } from 'lucide-react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLORS = ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7'];

interface DashboardProps {
  currentUser: User;
  displayPoints: number;
  setCurrentView: (view: AppView) => void;
  lang: Language;
}

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  isCustomizing: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children, isCustomizing }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className={`mb-6 ${isDragging ? 'opacity-50' : ''}`}>
      {isCustomizing && (
        <div 
          {...attributes} 
          {...listeners} 
          className="absolute top-2 right-2 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-lg cursor-grab active:cursor-grabbing backdrop-blur-sm border border-white/10 transition-colors"
        >
          <GripVertical className="h-5 w-5 text-white/70" />
        </div>
      )}
      {children}
    </div>
  );
};

const StatsWidget = ({ currentUser, displayPoints, t, isEshel }: { currentUser: User, displayPoints: number, t: any, isEshel: boolean }) => (
  <div className={`border ${isEshel ? 'border-pink-500/20 bg-pink-500/5' : 'border-white/10 bg-white/5'} p-8 relative overflow-hidden rounded-3xl backdrop-blur-xl h-full`}>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-8">
          <div>
              <div className={`text-sm font-medium ${isEshel ? 'text-pink-400' : 'text-eco-400'} mb-1 flex items-center gap-2`}>Welcome back</div>
              <h2 className="text-4xl font-bold text-white tracking-tight">{currentUser.name}</h2>
              <div className={`text-sm ${isEshel ? 'text-pink-300/60' : 'text-gray-400'} mt-1`}>Section {currentUser.section || 'N/A'}</div>
          </div>
          <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${isEshel ? 'bg-pink-500/10 text-pink-400' : 'bg-eco-500/10 text-eco-400'} rounded-full text-xs font-medium`}>
                  <span className={`w-2 h-2 ${isEshel ? 'bg-pink-500' : 'bg-eco-500'} rounded-full animate-pulse`}></span>
                  {t.live}
              </div>
          </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`bg-black/20 p-4 rounded-2xl border border-white/5`}>
          <div className={`text-xs font-medium ${isEshel ? 'text-pink-400' : 'text-gray-400'} mb-1`}>{t.score}</div>
          <div className="text-3xl font-bold text-white tabular-nums">{displayPoints}</div>
        </div>
        <div className={`bg-black/20 p-4 rounded-2xl border border-white/5`}>
          <div className={`text-xs font-medium ${isEshel ? 'text-pink-400' : 'text-gray-400'} mb-1`}>{t.logs}</div>
          <div className="text-3xl font-bold text-white">{currentUser.actions.length}</div>
        </div>
        <div className={`bg-black/20 p-4 rounded-2xl border border-white/5`}>
          <div className="text-xs font-medium text-orange-400 mb-1">{t.streak}</div>
          <div className="text-3xl font-bold text-white flex items-baseline gap-1">{currentUser.currentStreak} <span className="text-sm font-normal text-gray-500">{t.days}</span></div>
        </div>
      </div>
    </div>
  </div>
);

const ActivityWidget = ({ recentActions, t }: { recentActions: any[], t: any }) => (
  <div className="border border-white/10 bg-white/5 p-6 rounded-3xl backdrop-blur-md h-full">
    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
        <div className="w-1 h-4 bg-eco-500 rounded-full"></div>
        {t.recentActivity}
    </h3>
    {recentActions.length === 0 ? (
      <div className="text-center py-12 text-gray-500 text-sm">{t.noData}</div>
    ) : (
      <div className="space-y-3">
        {recentActions.map((action, idx) => (
          <motion.div 
            key={action.id} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex justify-between items-center text-sm p-3 hover:bg-white/5 transition-colors rounded-xl group"
          >
            <div className="flex-1">
                <div className="text-gray-200 font-medium group-hover:text-white transition-colors">{action.description}</div>
                <div className="text-xs text-gray-500 mt-0.5">{new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <span className="font-bold text-eco-400 bg-eco-500/10 px-2 py-1 rounded-lg">+{action.points}</span>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);

const ImpactWidget = ({ chartData, t }: { chartData: any[], t: any }) => (
  <div className="border border-white/10 bg-white/5 p-6 flex flex-col rounded-3xl backdrop-blur-md h-full">
     <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
        <div className="w-1 h-4 bg-eco-500 rounded-full"></div>
        {t.impactAnalysis}
     </h3>
     <div className="h-[200px] w-full mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
              {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
            </Pie>
            <RechartsTooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }} 
                itemStyle={{ color: '#fff' }} 
                cursor={false}
            />
          </PieChart>
        </ResponsiveContainer>
     </div>
  </div>
);

const ActionsWidget = ({ setCurrentView, t, lang }: { setCurrentView: (view: AppView) => void, t: any, lang: Language }) => (
  <div className="grid grid-cols-1 gap-4 h-full">
      <button onClick={() => setCurrentView(AppView.LEADERBOARD)} className="w-full bg-white/5 border border-white/10 text-white py-4 text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 rounded-2xl group h-full">
          {t.viewRankings} 
          <span className="bg-white/10 p-1 rounded-full group-hover:bg-white/20 transition-colors">
              {lang === 'en' ? <ArrowRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4 rotate-180" />}
          </span>
      </button>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ currentUser, displayPoints, setCurrentView, lang }) => {
  const t = translations[lang];
  const isEshel = currentUser.name.toLowerCase() === 'eshel';
  
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [items, setItems] = useState<string[]>(() => {
    const savedOrder = localStorage.getItem(`dashboard_order_${currentUser.id}`);
    return savedOrder ? JSON.parse(savedOrder) : ['stats', 'activity', 'impact', 'actions'];
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem(`dashboard_order_${currentUser.id}`, JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  const userActions = currentUser.actions || [];
  const recentActions = [...userActions].reverse().slice(0, 5);
  const chartData = userActions.length > 0 
    ? userActions.map((a, i) => ({ name: `Log ${i+1}`, value: a.points }))
    : [{ name: 'No Data', value: 100 }];

  const renderWidget = (id: string) => {
    switch (id) {
      case 'stats': return <StatsWidget currentUser={currentUser} displayPoints={displayPoints} t={t} isEshel={isEshel} />;
      case 'activity': return <ActivityWidget recentActions={recentActions} t={t} />;
      case 'impact': return <ImpactWidget chartData={chartData} t={t} />;
      case 'actions': return <ActionsWidget setCurrentView={setCurrentView} t={t} lang={lang} />;
      default: return null;
    }
  };

  const handleResetLayout = () => {
    const defaultOrder = ['stats', 'activity', 'impact', 'actions'];
    setItems(defaultOrder);
    localStorage.removeItem(`dashboard_order_${currentUser.id}`);
  };

  return (
    <div className="space-y-6 relative z-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
            <h2 className="text-xl font-bold text-white hidden md:block">{t.navDashboard}</h2>
            {isCustomizing && (
                <p className="text-sm text-eco-400 animate-pulse flex items-center gap-2">
                    <GripVertical className="h-4 w-4" />
                    Drag widgets to reorder
                </p>
            )}
        </div>
        <div className="flex-1 md:flex-none flex justify-end gap-2 w-full md:w-auto">
            {isCustomizing && (
                <button 
                    onClick={handleResetLayout}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                >
                    Reset
                </button>
            )}
            <button 
                onClick={() => setIsCustomizing(!isCustomizing)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    isCustomizing 
                    ? 'bg-eco-500 text-white shadow-lg shadow-eco-500/20' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
            >
                {isCustomizing ? (
                    <>
                        <Check className="h-4 w-4" />
                        Done
                    </>
                ) : (
                    <>
                        <LayoutDashboard className="h-4 w-4" />
                        Customize
                    </>
                )}
            </button>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={items}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 gap-6">
            {items.map((id) => (
               <SortableItem key={id} id={id} isCustomizing={isCustomizing}>
                 {renderWidget(id)}
               </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Dashboard;
