import React, { useState } from 'react';
import { User, EcoAction } from '../types';
import { CheckCircle, XCircle, RefreshCw, Shield, Video } from 'lucide-react';

interface ModerationProps {
  currentUser: User;
  users: User[];
  onApprove: (userId: string, actionId: string) => void;
  onReject: (userId: string, actionId: string) => void;
  onReassignModerator: (userId: string, actionId: string) => void;
  onSendToAdmin: (userId: string, actionId: string) => void;
}

const Moderation: React.FC<ModerationProps> = ({ currentUser, users, onApprove, onReject, onReassignModerator, onSendToAdmin }) => {
  // Find all actions assigned to the current user
  const pendingActions: { user: User, action: EcoAction }[] = [];
  
  users.forEach(u => {
    u.actions.forEach(a => {
      if (a.status === 'pending_review' && a.assignedTo === currentUser.id) {
        pendingActions.push({ user: u, action: a });
      }
    });
  });

  if (pendingActions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
        <Shield className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">All Caught Up!</h2>
        <p className="text-gray-500">There are no pending actions assigned to you for review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-indigo-500" />
          <h2 className="text-2xl font-bold text-gray-800">Moderation Queue</h2>
        </div>
        
        <div className="space-y-6">
          {pendingActions.map(({ user, action }) => (
            <div key={action.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{user.name} ({user.section || 'No Section'})</h3>
                  <p className="text-sm text-gray-500">Submitted: {new Date(action.timestamp).toLocaleString()}</p>
                  <p className="text-sm font-medium text-indigo-600 mt-1">Confidence Score: {action.confidenceScore}%</p>
                  <p className="text-sm text-gray-700 mt-2"><strong>AI Comment:</strong> {action.aiComment}</p>
                  <p className="text-sm text-gray-700 mt-1"><strong>Proposed Points:</strong> {action.proposedPoints || 0}</p>
                </div>
              </div>

              {action.videoData && (
                <div className="mb-6 rounded-xl overflow-hidden bg-black aspect-video relative">
                  <video 
                    src={`data:${action.mimeType || 'video/webm'};base64,${action.videoData}`} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => onApprove(user.id, action.id)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
                <button 
                  onClick={() => onReject(user.id, action.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-3">
                <button 
                  onClick={() => onReassignModerator(user.id, action.id)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Send to Random Mod
                </button>
                <button 
                  onClick={() => onSendToAdmin(user.id, action.id)}
                  className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  Send to Admin
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Moderation;
