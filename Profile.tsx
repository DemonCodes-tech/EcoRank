import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Language } from './types';
import { translations } from './translations';
import { Upload, Check, X, User as UserIcon, Shield } from 'lucide-react';
import AnimatedProfilePicture from './AnimatedProfilePicture';

interface ProfileProps {
  currentUser: User;
  users: User[];
  onUpdateUser: (updatedUser: User) => void;
  onUpdateUsers: (updatedUsers: User[]) => void;
  onCreateUser: (name: string, pin: string, section: string, role: 'student' | 'moderator' | 'admin' | 'beta') => void;
  onDeleteUser: (userId: string) => void;
  lang: Language;
  themeId?: string;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, users, onUpdateUser, onUpdateUsers, onCreateUser, onDeleteUser, lang, themeId }) => {
  const t = translations[lang];
  const [bioInput, setBioInput] = useState(currentUser.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  
  const [nicknameInput, setNicknameInput] = useState(currentUser.nickname || '');
  const [realNameInput, setRealNameInput] = useState(currentUser.realName || '');
  const [isEditingNames, setIsEditingNames] = useState(false);

  // Create User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserPin, setNewUserPin] = useState('');
  const [newUserSection, setNewUserSection] = useState('10b1');
  const [newUserRole, setNewUserRole] = useState<'student' | 'moderator' | 'admin' | 'beta'>('student');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPin.trim()) return;
    onCreateUser(newUserName.trim(), newUserPin.trim(), newUserSection, newUserRole);
    setNewUserName('');
    setNewUserPin('');
    setShowCreateForm(false);
    alert(t.userCreated);
  };

  const handleDeleteUserClick = (userId: string) => {
    if (window.confirm(t.confirmDelete)) {
      onDeleteUser(userId);
      alert(t.userDeleted);
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const needsClear = 
      (currentUser.profilePictureStatus === 'approved' || currentUser.profilePictureStatus === 'rejected') ||
      (currentUser.bioStatus === 'approved' || currentUser.bioStatus === 'rejected') ||
      (currentUser.nicknameStatus === 'approved' || currentUser.nicknameStatus === 'rejected') ||
      (currentUser.pinResetStatus === 'approved' || currentUser.pinResetStatus === 'rejected');

    if (needsClear) {
      timeoutId = setTimeout(() => {
        const updatedUser = { ...currentUser };
        let changed = false;

        if (updatedUser.profilePictureStatus === 'approved' || updatedUser.profilePictureStatus === 'rejected') {
          updatedUser.profilePictureStatus = undefined;
          changed = true;
        }
        if (updatedUser.bioStatus === 'approved' || updatedUser.bioStatus === 'rejected') {
          updatedUser.bioStatus = undefined;
          changed = true;
        }
        if (updatedUser.nicknameStatus === 'approved' || updatedUser.nicknameStatus === 'rejected') {
          updatedUser.nicknameStatus = undefined;
          changed = true;
        }
        if (updatedUser.pinResetStatus === 'approved' || updatedUser.pinResetStatus === 'rejected') {
          updatedUser.pinResetStatus = undefined;
          changed = true;
        }

        if (changed) {
          onUpdateUser(updatedUser);
        }
      }, 3000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentUser.profilePictureStatus, currentUser.bioStatus, currentUser.nicknameStatus, currentUser.pinResetStatus, currentUser, onUpdateUser]);

  const handleSaveBio = () => {
    const isModOrAdmin = currentUser.role === 'moderator' || currentUser.role === 'admin';
    const updatedUser = { 
      ...currentUser, 
      ...(isModOrAdmin ? {
        bio: bioInput,
        pendingBio: undefined,
        bioStatus: 'approved' as const
      } : {
        pendingBio: bioInput,
        bioStatus: 'pending' as const
      })
    };
    onUpdateUser(updatedUser);
    setIsEditingBio(false);
  };

  const handleSaveNames = () => {
    const isModOrAdmin = currentUser.role === 'moderator' || currentUser.role === 'admin';
    const updatedUser = {
      ...currentUser,
      realName: realNameInput
    };
    
    if (nicknameInput !== currentUser.nickname) {
      if (isModOrAdmin) {
        updatedUser.nickname = nicknameInput;
        updatedUser.pendingNickname = undefined;
        updatedUser.nicknameStatus = 'approved';
      } else {
        updatedUser.pendingNickname = nicknameInput;
        updatedUser.nicknameStatus = 'pending';
      }
    }
    
    onUpdateUser(updatedUser);
    setIsEditingNames(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Increased from 200
        const MAX_HEIGHT = 800; // Increased from 200
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Use PNG for better quality and transparency support
        const dataUrl = canvas.toDataURL('image/png'); 

        const isModOrAdmin = currentUser.role === 'moderator' || currentUser.role === 'admin';
        const updatedUser = {
          ...currentUser,
          ...(isModOrAdmin ? {
            profilePicture: dataUrl,
            pendingProfilePicture: undefined,
            profilePictureStatus: 'approved' as const
          } : {
            pendingProfilePicture: dataUrl,
            profilePictureStatus: 'pending' as const
          })
        };
        onUpdateUser(updatedUser);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const pendingPfpUsers = users.filter(u => u.profilePictureStatus === 'pending' && u.pendingProfilePicture);
  const pendingBioUsers = users.filter(u => u.bioStatus === 'pending' && u.pendingBio);
  const pendingNicknameUsers = users.filter(u => u.nicknameStatus === 'pending' && u.pendingNickname);
  const pendingPinResets = users.filter(u => u.pinResetStatus === 'pending' && u.pendingPin);
  const moderators = users.filter(u => u.role === 'moderator');
  const betaTesters = users.filter(u => u.role === 'beta');
  const students = users.filter(u => u.role === 'student' || !u.role);

  const handleModeratePinReset = (userId: string, isApproved: boolean) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        if (isApproved) {
          return {
            ...u,
            pin: u.pendingPin,
            pendingPin: undefined,
            pinResetStatus: 'approved' as const
          };
        } else {
          return {
            ...u,
            pendingPin: undefined,
            pinResetStatus: 'rejected' as const
          };
        }
      }
      return u;
    });
    
    onUpdateUsers(updatedUsers);
    
    if (currentUser.id === userId) {
      const updatedCurrentUser = updatedUsers.find(u => u.id === userId);
      if (updatedCurrentUser) onUpdateUser(updatedCurrentUser);
    }
  };

  const handleModeratePfp = (userId: string, isApproved: boolean) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        if (isApproved) {
          return {
            ...u,
            profilePicture: u.pendingProfilePicture,
            pendingProfilePicture: undefined,
            profilePictureStatus: 'approved' as const
          };
        } else {
          return {
            ...u,
            pendingProfilePicture: undefined,
            profilePictureStatus: 'rejected' as const
          };
        }
      }
      return u;
    });
    
    onUpdateUsers(updatedUsers);
    
    if (currentUser.id === userId) {
      const updatedCurrentUser = updatedUsers.find(u => u.id === userId);
      if (updatedCurrentUser) onUpdateUser(updatedCurrentUser);
    }
  };

  const handleModerateBio = (userId: string, isApproved: boolean) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        if (isApproved) {
          return {
            ...u,
            bio: u.pendingBio,
            pendingBio: undefined,
            bioStatus: 'approved' as const
          };
        } else {
          return {
            ...u,
            pendingBio: undefined,
            bioStatus: 'rejected' as const
          };
        }
      }
      return u;
    });
    
    onUpdateUsers(updatedUsers);
    
    if (currentUser.id === userId) {
      const updatedCurrentUser = updatedUsers.find(u => u.id === userId);
      if (updatedCurrentUser) onUpdateUser(updatedCurrentUser);
    }
  };

  const handleModerateNickname = (userId: string, isApproved: boolean) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        if (isApproved) {
          return {
            ...u,
            nickname: u.pendingNickname,
            pendingNickname: undefined,
            nicknameStatus: 'approved' as const
          };
        } else {
          return {
            ...u,
            pendingNickname: undefined,
            nicknameStatus: 'rejected' as const
          };
        }
      }
      return u;
    });
    
    onUpdateUsers(updatedUsers);
    
    if (currentUser.id === userId) {
      const updatedCurrentUser = updatedUsers.find(u => u.id === userId);
      if (updatedCurrentUser) onUpdateUser(updatedCurrentUser);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <UserIcon className="h-6 w-6 text-eco-500" />
          {t.profileTitle}
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center gap-4">
            <AnimatedProfilePicture
              profilePicture={currentUser.pendingProfilePicture || currentUser.profilePicture}
              borderType={currentUser.borderType}
              size="xl"
              className={currentUser.pendingProfilePicture ? 'opacity-50' : ''}
              themeId={themeId}
            />
            
            {currentUser.profilePictureStatus === 'pending' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm rounded-full pointer-events-none">
                <span className="text-xs font-bold text-yellow-400 text-center px-2">{t.pfpPending}</span>
              </div>
            )}
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-medium"
            >
              <Upload className="h-4 w-4" />
              {t.uploadPfp}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="w-full mt-4">
              <label className="block text-xs text-gray-400 mb-2 text-center">PFP Border Animation</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'pixel-cat-gray', label: 'Cat (Gray)' },
                  { id: 'pixel-cat-white', label: 'Cat (White)' },
                  { id: 'pixel-snake', label: 'Snake' }
                ].map((border) => (
                  <button
                    key={border.id}
                    onClick={() => onUpdateUser({ ...currentUser, borderType: border.id as any })}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      (currentUser.borderType || 'none') === border.id 
                        ? 'bg-eco-500/20 border-eco-500 text-eco-400' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {border.label}
                  </button>
                ))}
              </div>
            </div>
            
            {currentUser.profilePictureStatus && (
              <div className="mt-1 flex flex-col items-center gap-1">
                {currentUser.profilePictureStatus === 'pending' && (
                  <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded text-[10px] font-bold uppercase tracking-wider">{t.pfpPending}</span>
                )}
                {currentUser.profilePictureStatus === 'rejected' && (
                  <span className="px-2 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded text-[10px] font-bold uppercase tracking-wider">{t.pfpRejected}</span>
                )}
                {currentUser.profilePictureStatus === 'approved' && (
                  <span className="px-2 py-1 bg-eco-500/20 border border-eco-500/30 text-eco-400 rounded text-[10px] font-bold uppercase tracking-wider">{t.pfpApproved}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-3xl font-bold text-white">{currentUser.name}</h3>
                {!isEditingNames ? (
                  <button onClick={() => setIsEditingNames(true)} className="text-xs text-eco-400 hover:text-eco-300">{t.editNames}</button>
                ) : (
                  <button onClick={handleSaveNames} className="text-xs text-eco-400 hover:text-eco-300">{t.saveNames}</button>
                )}
              </div>
              
              {isEditingNames ? (
                <div className="mt-4 space-y-3 mb-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{t.realName}</label>
                    <input 
                      type="text"
                      value={realNameInput}
                      onChange={(e) => setRealNameInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white text-sm focus:outline-none focus:border-eco-500"
                      placeholder={t.realName}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">{t.nickname}</label>
                    <input 
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white text-sm focus:outline-none focus:border-eco-500"
                      placeholder={t.nickname}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-300 flex flex-col gap-2">
                  {currentUser.realName && <p><span className="text-gray-500">{t.realName}:</span> {currentUser.realName}</p>}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{t.nickname}:</span>
                    {currentUser.pendingNickname ? (
                      <span className="opacity-50">{currentUser.pendingNickname}</span>
                    ) : currentUser.nickname ? (
                      <span>{currentUser.nickname}</span>
                    ) : (
                      <span className="text-gray-500 italic">None</span>
                    )}
                    {currentUser.nicknameStatus === 'pending' && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded text-[10px] font-bold uppercase tracking-wider">{t.nicknamePending}</span>
                    )}
                    {currentUser.nicknameStatus === 'rejected' && (
                      <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded text-[10px] font-bold uppercase tracking-wider">{t.nicknameRejected}</span>
                    )}
                    {currentUser.nicknameStatus === 'approved' && (
                      <span className="px-2 py-0.5 bg-eco-500/20 border border-eco-500/30 text-eco-400 rounded text-[10px] font-bold uppercase tracking-wider">{t.nicknameApproved}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mt-3">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  currentUser.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                  currentUser.role === 'moderator' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  currentUser.role === 'beta' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-eco-500/20 text-eco-400 border-eco-500/30'
                }`}>
                  {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'moderator' ? 'Moderator' : currentUser.role === 'beta' ? 'Beta Tester' : 'Student'}
                </span>
                <span className="px-2 py-1 bg-white/10 border border-white/10 text-gray-300 rounded text-[10px] font-bold uppercase tracking-wider">
                  Section {currentUser.section || 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-medium text-gray-300">Bio</h4>
                  {currentUser.bioStatus === 'pending' && (
                    <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded text-[10px] font-bold uppercase tracking-wider">{t.bioPending}</span>
                  )}
                  {currentUser.bioStatus === 'rejected' && (
                    <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded text-[10px] font-bold uppercase tracking-wider">{t.bioRejected}</span>
                  )}
                  {currentUser.bioStatus === 'approved' && (
                    <span className="px-2 py-0.5 bg-eco-500/20 border border-eco-500/30 text-eco-400 rounded text-[10px] font-bold uppercase tracking-wider">{t.bioApproved}</span>
                  )}
                </div>
                {!isEditingBio ? (
                  <button onClick={() => setIsEditingBio(true)} className="text-xs text-eco-400 hover:text-eco-300">{t.editBio}</button>
                ) : (
                  <button onClick={handleSaveBio} className="text-xs text-eco-400 hover:text-eco-300">{t.saveBio}</button>
                )}
              </div>
              
              {isEditingBio ? (
                <textarea 
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-eco-500 min-h-[100px]"
                  placeholder="Tell us about your eco-journey..."
                  maxLength={200}
                />
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                    {currentUser.pendingBio ? (
                      <span className="opacity-50">{currentUser.pendingBio}</span>
                    ) : currentUser.bio ? (
                      currentUser.bio
                    ) : (
                      "No bio added yet."
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(currentUser.role === 'moderator' || currentUser.role === 'admin') && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-8">
          {/* Create User Section */}
          {currentUser.role === 'admin' && (
            <div className="border-b border-white/5 pb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-eco-500" />
                  {t.createUser}
                </h2>
                <button 
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-4 py-2 bg-eco-600 hover:bg-eco-500 text-white rounded-xl text-sm font-bold transition-all"
                >
                  {showCreateForm ? t.cancel : t.createUser}
                </button>
              </div>

              {showCreateForm && (
                <form onSubmit={handleCreateUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 p-6 rounded-2xl border border-white/5">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">{t.name}</label>
                    <input 
                      type="text" 
                      value={newUserName} 
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-eco-500"
                      placeholder="Username/Email"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">PIN</label>
                    <input 
                      type="text" 
                      value={newUserPin} 
                      onChange={(e) => setNewUserPin(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-eco-500"
                      placeholder="PIN"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">{t.section}</label>
                    <select 
                      value={newUserSection} 
                      onChange={(e) => setNewUserSection(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-eco-500"
                    >
                      <option value="9b1">9B1</option>
                      <option value="9b2">9B2</option>
                      <option value="9g1">9G1</option>
                      <option value="9g2">9G2</option>
                      <option value="10b1">10B1</option>
                      <option value="10b2">10B2</option>
                      <option value="10g1">10G1</option>
                      <option value="11b1">11B1</option>
                      <option value="11b2">11B2</option>
                      <option value="11g1">11G1</option>
                      <option value="12b1">12B1</option>
                      <option value="12b2">12B2</option>
                      <option value="12g1">12G1</option>
                      <option value="12g2">12G2</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">{t.role}</label>
                    <select 
                      value={newUserRole} 
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-eco-500"
                    >
                      <option value="student">{t.student}</option>
                      <option value="moderator">{t.moderator}</option>
                      {currentUser.role === 'admin' && <option value="admin">{t.admin}</option>}
                      {currentUser.role === 'admin' && <option value="beta">Beta Tester</option>}
                    </select>
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button type="submit" className="w-full py-3 bg-eco-600 hover:bg-eco-500 text-white rounded-xl font-bold transition-all">
                      {t.createUser}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  {currentUser.role === 'admin' ? 'Admin Panel - Moderators' : 'Moderator Panel - Moderators'}
                </h2>
                {moderators.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No moderators found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {moderators.map(mod => (
                      <div key={mod.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-4">
                        <div className="text-center">
                          <p className="text-white font-medium">{mod.name}</p>
                          <p className="text-xs text-gray-400">Section {mod.section || 'N/A'}</p>
                        </div>
                        <div className="w-full flex flex-col gap-2">
                          <button
                            disabled
                            className="w-full py-2 bg-purple-500/10 text-purple-400/50 border border-purple-500/20 rounded-xl text-sm font-bold cursor-not-allowed"
                            title="Account switching is restricted to the mobile app for security reasons."
                          >
                            Login as {mod.name} (Mobile Only)
                          </button>
                          <button
                            onClick={() => handleDeleteUserClick(mod.id)}
                            className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-bold transition-all"
                          >
                            {t.deleteUser}
                          </button>
                          <button
                            onClick={() => {
                              const updatedUser = { ...mod, role: 'student' as const };
                              onUpdateUsers(users.map(u => u.id === mod.id ? updatedUser : u));
                            }}
                            className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-xl text-sm font-bold transition-all"
                          >
                            Demote to Student
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-500" />
                  {currentUser.role === 'admin' ? 'Admin Panel - Beta Testers' : 'Moderator Panel - Beta Testers'}
                </h2>
                {betaTesters.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No beta testers found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {betaTesters.map(bt => (
                      <div key={bt.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-4">
                        <div className="text-center">
                          <p className="text-white font-medium">{bt.name}</p>
                          <p className="text-xs text-gray-400">Section {bt.section || 'N/A'}</p>
                        </div>
                        <div className="w-full flex flex-col gap-2">
                          <button
                            onClick={() => handleDeleteUserClick(bt.id)}
                            className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-bold transition-all"
                          >
                            {t.deleteUser}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  {currentUser.role === 'admin' ? 'Admin Panel - Students' : 'Moderator Panel - Students'}
                </h2>
                {students.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No students found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {students.map(student => (
                      <div key={student.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-4">
                        <div className="text-center">
                          <p className="text-white font-medium">{student.name}</p>
                          <p className="text-xs text-gray-400">Section {student.section || 'N/A'}</p>
                        </div>
                        <div className="w-full flex flex-col gap-2">
                          <button
                            disabled
                            className="w-full py-2 bg-purple-500/10 text-purple-400/50 border border-purple-500/20 rounded-xl text-sm font-bold cursor-not-allowed"
                            title="Account switching is restricted to the mobile app for security reasons."
                          >
                            Login as {student.name} (Mobile Only)
                          </button>
                          <button
                            onClick={() => handleDeleteUserClick(student.id)}
                            className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-bold transition-all"
                          >
                            {t.deleteUser}
                          </button>
                          <button
                            onClick={() => {
                              const updatedUser = { ...student, role: 'moderator' as const };
                              onUpdateUsers(users.map(u => u.id === student.id ? updatedUser : u));
                            }}
                            className="w-full py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl text-sm font-bold transition-all"
                          >
                            Promote to Moderator
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-500" />
              {t.moderationQueue} - Profile Pictures
            </h2>
            
            {pendingPfpUsers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">{t.noPendingPfps}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {pendingPfpUsers.map(user => (
                  <div key={user.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-4">
                    <img src={user.pendingProfilePicture} alt={`Pending for ${user.name}`} className="w-24 h-24 rounded-full object-cover border-2 border-yellow-500/50" />
                    <div className="text-center">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-xs text-gray-400">Section {user.section}</p>
                    </div>
                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => handleModeratePfp(user.id, true)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-eco-500/20 hover:bg-eco-500/30 text-eco-400 rounded-xl transition-colors text-xs font-bold"
                      >
                        <Check className="h-3 w-3" /> {t.approve}
                      </button>
                      <button 
                        onClick={() => handleModeratePfp(user.id, false)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors text-xs font-bold"
                      >
                        <X className="h-3 w-3" /> {t.reject}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-500" />
              {t.moderationQueue} - Bios
            </h2>
            
            {pendingBioUsers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">{t.noPendingBios}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingBioUsers.map(user => (
                  <div key={user.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col gap-4">
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-xs text-gray-400 mb-2">Section {user.section}</p>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-sm text-gray-300 whitespace-pre-wrap">
                        {user.pendingBio}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full mt-auto">
                      <button 
                        onClick={() => handleModerateBio(user.id, true)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-eco-500/20 hover:bg-eco-500/30 text-eco-400 rounded-xl transition-colors text-xs font-bold"
                      >
                        <Check className="h-3 w-3" /> {t.approve}
                      </button>
                      <button 
                        onClick={() => handleModerateBio(user.id, false)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors text-xs font-bold"
                      >
                        <X className="h-3 w-3" /> {t.reject}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-500" />
              {t.moderationQueue} - Nicknames
            </h2>
            
            {pendingNicknameUsers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">{t.noPendingNicknames}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingNicknameUsers.map(user => (
                  <div key={user.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col gap-4">
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-xs text-gray-400 mb-2">Section {user.section}</p>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-sm text-gray-300">
                        <span className="text-gray-500 mr-2">Requested Nickname:</span>
                        <span className="font-bold text-white">{user.pendingNickname}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full mt-auto">
                      <button 
                        onClick={() => handleModerateNickname(user.id, true)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-eco-500/20 hover:bg-eco-500/30 text-eco-400 rounded-xl transition-colors text-xs font-bold"
                      >
                        <Check className="h-3 w-3" /> {t.approve}
                      </button>
                      <button 
                        onClick={() => handleModerateNickname(user.id, false)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors text-xs font-bold"
                      >
                        <X className="h-3 w-3" /> {t.reject}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-500" />
              {lang === 'ar' ? 'طلبات إعادة تعيين رمز PIN' : 'PIN Reset Requests'}
            </h2>
            
            {pendingPinResets.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">{lang === 'ar' ? 'لا توجد طلبات معلقة' : 'No pending requests'}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPinResets.map(user => (
                  <div key={user.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col gap-4">
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-xs text-gray-400 mb-2">Section {user.section}</p>
                      <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-sm text-gray-300 space-y-1">
                        <div>
                          <span className="text-gray-500 mr-2">{lang === 'ar' ? 'رمز PIN القديم:' : 'Old PIN:'}</span>
                          <span className="font-bold text-white font-mono">{user.pin || 'None'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 mr-2">{lang === 'ar' ? 'رمز PIN الجديد:' : 'New PIN:'}</span>
                          <span className="font-bold text-white font-mono">{user.pendingPin}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full mt-auto">
                      <button 
                        onClick={() => handleModeratePinReset(user.id, true)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-eco-500/20 hover:bg-eco-500/30 text-eco-400 rounded-xl transition-colors text-xs font-bold"
                      >
                        <Check className="h-3 w-3" /> {t.approve}
                      </button>
                      <button 
                        onClick={() => handleModeratePinReset(user.id, false)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors text-xs font-bold"
                      >
                        <X className="h-3 w-3" /> {t.reject}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
