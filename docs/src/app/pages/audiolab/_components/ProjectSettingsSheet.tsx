'use client';

import { useState, useEffect } from 'react';
import { X, Pencil, Trash2, Download, Loader2, Check, UserPlus, Search, Users } from 'lucide-react';
import { updateProject, deleteProject, addCollaborator, removeCollaborator } from '../_lib/project-service';
import { FirebaseChatService } from '@/app/pages/groups/_lib/firebase-chat-service';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';
import { useAudioLab } from '../_context/AudioLabContext';
import type { AudioLabProject } from '../_types';

interface ZoneMember {
  id: string;
  name: string;
  avatar?: string;
}

interface ProjectSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  project: AudioLabProject | null;
  onProjectUpdated: (project: AudioLabProject) => void;
  onProjectDeleted: () => void;
}

export function ProjectSettingsSheet({
  isOpen,
  onClose,
  project,
  onProjectUpdated,
  onProjectDeleted
}: ProjectSettingsSheetProps) {
  const { user } = useAuth();
  const { currentZone } = useZone();
  const { state } = useAudioLab();
  
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(project?.name || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Invite collaborator state
  const [showInvite, setShowInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ZoneMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingCollaborator, setIsAddingCollaborator] = useState<string | null>(null);
  const [collaboratorDetails, setCollaboratorDetails] = useState<ZoneMember[]>([]);

  // Load collaborator details when project changes
  useEffect(() => {
    if (project?.collaborators && project.collaborators.length > 0) {
      loadCollaboratorDetails();
    } else {
      setCollaboratorDetails([]);
    }
  }, [project?.collaborators]);

  const loadCollaboratorDetails = async () => {
    if (!project?.collaborators) return;
    
    const details: ZoneMember[] = [];
    for (const userId of project.collaborators) {
      try {
        const userInfo = await FirebaseChatService.getUser(userId);
        if (userInfo) {
          details.push({
            id: userId,
            name: userInfo.fullName || userInfo.firstName || 'Unknown',
            avatar: userInfo.profilePic || undefined
          });
        }
      } catch (error) {
        console.error('[ProjectSettings] Error loading collaborator:', error);
      }
    }
    setCollaboratorDetails(details);
  };

  // Search for zone members
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || !user?.uid || !currentZone?.id) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await FirebaseChatService.searchUsers(query, user.uid, currentZone.id);
      // Filter out existing collaborators and owner
      const filtered = results
        .filter(r => r.id !== project?.ownerId && !project?.collaborators?.includes(r.id))
        .map(r => ({
          id: r.id,
          name: r.fullName || r.firstName || 'Unknown',
          avatar: r.profilePic || undefined
        }));
      setSearchResults(filtered);
    } catch (error) {
      console.error('[ProjectSettings] Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add collaborator
  const handleAddCollaborator = async (member: ZoneMember) => {
    if (!project) return;
    
    setIsAddingCollaborator(member.id);
    try {
      const result = await addCollaborator(project.id, member.id);
      if (result.success) {
        const updatedCollaborators = [...(project.collaborators || []), member.id];
        onProjectUpdated({ ...project, collaborators: updatedCollaborators });
        setCollaboratorDetails(prev => [...prev, member]);
        setSearchResults(prev => prev.filter(r => r.id !== member.id));
        setSearchQuery('');
      }
    } catch (error) {
      console.error('[ProjectSettings] Add collaborator error:', error);
    } finally {
      setIsAddingCollaborator(null);
    }
  };

  // Remove collaborator
  const handleRemoveCollaborator = async (userId: string) => {
    if (!project) return;
    
    setIsAddingCollaborator(userId);
    try {
      const result = await removeCollaborator(project.id, userId);
      if (result.success) {
        const updatedCollaborators = project.collaborators.filter(id => id !== userId);
        onProjectUpdated({ ...project, collaborators: updatedCollaborators });
        setCollaboratorDetails(prev => prev.filter(c => c.id !== userId));
      }
    } catch (error) {
      console.error('[ProjectSettings] Remove collaborator error:', error);
    } finally {
      setIsAddingCollaborator(null);
    }
  };

  if (!isOpen || !project) return null;

  const handleRename = async () => {
    if (!newName.trim() || newName === project.name) {
      setIsRenaming(false);
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProject(project.id, { name: newName.trim() });
      if (result.success) {
        onProjectUpdated({ ...project, name: newName.trim() });
        setIsRenaming(false);
      }
    } catch (error) {
      console.error('[ProjectSettings] Rename failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteProject(project.id);
      if (result.success) {
        onProjectDeleted();
        onClose();
      }
    } catch (error) {
      console.error('[ProjectSettings] Delete failed:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleExport = async () => {
    // Collect all track audio URLs
    const tracksWithAudio = project.tracks.filter(t => t.audioUrl);
    
    if (tracksWithAudio.length === 0) {
      alert('No recordings to export yet');
      return;
    }

    // For now, download the first track
    // TODO: Implement proper mixing/export
    const firstTrack = tracksWithAudio[0];
    if (firstTrack.audioUrl) {
      const link = document.createElement('a');
      link.href = firstTrack.audioUrl;
      link.download = `${project.name}_${firstTrack.name}.webm`;
      link.click();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[90] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-[90] bg-[#131318] rounded-t-3xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Project Settings</h3>
          <button 
            onClick={onClose}
            className="size-8 rounded-full bg-slate-700 flex items-center justify-center text-white hover:bg-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className={`p-5 space-y-3 ${state?.isPlayerVisible ? 'pb-28' : 'pb-10'}`}>
          {/* Project Name */}
          {isRenaming ? (
            <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-xl border border-slate-700">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 bg-transparent text-white font-medium focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
              />
              <button
                onClick={handleRename}
                disabled={isSaving}
                className="size-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setNewName(project.name);
                setIsRenaming(true);
              }}
              className="w-full flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors text-left"
            >
              <div className="size-10 rounded-lg bg-slate-700 flex items-center justify-center">
                <Pencil size={20} className="text-slate-300" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Rename Project</p>
                <p className="text-slate-400 text-sm truncate">{project.name}</p>
              </div>
            </button>
          )}

          {/* Invite Collaborators */}
          {showInvite ? (
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white font-medium">Invite Collaborators</p>
                <button
                  onClick={() => {
                    setShowInvite(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Search Input */}
              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-700">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search zone members..."
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
                />
                {isSearching && <Loader2 size={16} className="text-emerald-400 animate-spin" />}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {searchResults.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50">
                      {member.avatar ? (
                        <img src={member.avatar} alt="" className="size-8 rounded-full object-cover" />
                      ) : (
                        <div className="size-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-sm font-bold">
                          {member.name[0]}
                        </div>
                      )}
                      <span className="flex-1 text-white text-sm truncate">{member.name}</span>
                      <button
                        onClick={() => handleAddCollaborator(member)}
                        disabled={isAddingCollaborator === member.id}
                        className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                      >
                        {isAddingCollaborator === member.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          'Add'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !isSearching && (
                <p className="text-slate-500 text-sm text-center py-2">No members found</p>
              )}

              {/* Current Collaborators */}
              {collaboratorDetails.length > 0 && (
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-slate-400 text-xs font-medium mb-2">Current Collaborators</p>
                  <div className="space-y-2">
                    {collaboratorDetails.map(collab => (
                      <div key={collab.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/50">
                        {collab.avatar ? (
                          <img src={collab.avatar} alt="" className="size-8 rounded-full object-cover" />
                        ) : (
                          <div className="size-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                            {collab.name[0]}
                          </div>
                        )}
                        <span className="flex-1 text-white text-sm truncate">{collab.name}</span>
                        <button
                          onClick={() => handleRemoveCollaborator(collab.id)}
                          disabled={isAddingCollaborator === collab.id}
                          className="px-2 py-1 text-red-400 text-xs font-bold hover:bg-red-500/20 rounded"
                        >
                          {isAddingCollaborator === collab.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            'Remove'
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowInvite(true)}
              className="w-full flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors text-left"
            >
              <div className="size-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <UserPlus size={20} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Invite Collaborators</p>
                <p className="text-slate-400 text-sm">
                  {collaboratorDetails.length > 0 
                    ? `${collaboratorDetails.length} collaborator${collaboratorDetails.length > 1 ? 's' : ''}`
                    : 'Let others add their recordings'
                  }
                </p>
              </div>
              {collaboratorDetails.length > 0 && (
                <div className="flex -space-x-2">
                  {collaboratorDetails.slice(0, 3).map(c => (
                    c.avatar ? (
                      <img key={c.id} src={c.avatar} alt="" className="size-6 rounded-full border-2 border-slate-800 object-cover" />
                    ) : (
                      <div key={c.id} className="size-6 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-slate-300 text-[10px] font-bold">
                        {c.name[0]}
                      </div>
                    )
                  ))}
                  {collaboratorDetails.length > 3 && (
                    <div className="size-6 rounded-full border-2 border-slate-800 bg-slate-600 flex items-center justify-center text-white text-[10px] font-bold">
                      +{collaboratorDetails.length - 3}
                    </div>
                  )}
                </div>
              )}
            </button>
          )}

          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors text-left"
          >
            <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Download size={20} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Export Recording</p>
              <p className="text-slate-400 text-sm">Download as audio file</p>
            </div>
          </button>

          {/* Delete */}
          {showDeleteConfirm ? (
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
              <p className="text-red-400 font-medium mb-3">Delete this project?</p>
              <p className="text-slate-400 text-sm mb-4">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 px-4 bg-slate-700 rounded-lg text-white font-medium hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 px-4 bg-red-500 rounded-lg text-white font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-red-500/10 hover:border-red-500/20 transition-colors text-left group"
            >
              <div className="size-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium group-hover:text-red-400 transition-colors">Delete Project</p>
                <p className="text-slate-400 text-sm">Remove permanently</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
