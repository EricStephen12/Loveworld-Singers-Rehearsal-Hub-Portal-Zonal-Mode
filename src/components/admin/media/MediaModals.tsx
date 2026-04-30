"use client";

import React from 'react';
import { Trash2, X, ListVideo, AlertCircle, CheckCircle } from 'lucide-react';

interface MediaModalsProps {
  deleteConfirm: { type: 'video' | 'playlist' | 'category'; id: string; name: string } | null;
  onCloseDelete: () => void;
  onConfirmDelete: (id: string) => void;
  toast: { type: 'success' | 'error'; message: string } | null;
  selectedVideoIds: string[];
  onCancelSelection: () => void;
  isBulkPlaylistOpen: boolean;
  setIsBulkPlaylistOpen: (open: boolean) => void;
  playlists: any[];
  onBulkAddToPlaylist: (pId: string) => void;
  onBulkDelete: () => void;
  zoneColor: string;
}

export const MediaModals: React.FC<MediaModalsProps> = ({
  deleteConfirm,
  onCloseDelete,
  onConfirmDelete,
  toast,
  selectedVideoIds,
  onCancelSelection,
  isBulkPlaylistOpen,
  setIsBulkPlaylistOpen,
  playlists,
  onBulkAddToPlaylist,
  onBulkDelete,
  zoneColor
}) => {
  return (
    <>
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete {deleteConfirm.type}?</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirm.name}"</span>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onCloseDelete}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => onConfirmDelete(deleteConfirm.id)}
                  className="flex-1 py-3 bg-red-500 text-white font-bold hover:bg-red-600 rounded-2xl transition-all shadow-lg shadow-red-200"
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedVideoIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-[32px] shadow-2xl flex items-center gap-8 text-white">
            <div className="flex items-center gap-4 pr-6 border-r border-white/10">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black" style={{ backgroundColor: zoneColor }}>
                {selectedVideoIds.length}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selected</span>
                <span className="text-xs font-black">Video{selectedVideoIds.length > 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <button
                  onClick={() => setIsBulkPlaylistOpen(!isBulkPlaylistOpen)}
                  className="flex items-center gap-2.5 text-xs font-black transition-all group"
                  style={{ color: isBulkPlaylistOpen ? zoneColor : undefined }}
                >
                  <ListVideo className="w-4 h-4" style={{ color: zoneColor }} /> Add to Playlist
                </button>

                {isBulkPlaylistOpen && (
                  <div className="absolute bottom-full mb-6 left-0 w-64 bg-slate-800 rounded-[24px] border border-white/10 shadow-2xl p-2">
                    <div className="max-h-60 overflow-y-auto scrollbar-hide">
                      {playlists.length === 0 ? (
                        <p className="p-4 text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">No playlists found</p>
                      ) : (
                        playlists.map(p => (
                          <button
                            key={p.id}
                            onClick={() => onBulkAddToPlaylist(p.id)}
                            className="w-full text-left p-3 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-colors flex items-center gap-3"
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zoneColor }} /> {p.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={onBulkDelete}
                className="flex items-center gap-2.5 text-xs font-black hover:text-red-400 transition-colors group"
              >
                <Trash2 className="w-4 h-4 text-red-500" /> Delete Batch
              </button>
              <button onClick={onCancelSelection} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[10000] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}
    </>
  );
};
