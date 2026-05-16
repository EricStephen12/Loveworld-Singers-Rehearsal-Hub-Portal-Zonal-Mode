'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Camera, X, Loader2, Send, Eye, Trash2, Heart, Mic, Music } from 'lucide-react'
import { useChatV2, StatusUpdate } from '../_context/ChatContextV2'
import { useAuth } from '@/hooks/useAuth'
import { SyncAvatar } from './SyncAvatar'
import { CustomFilePicker } from './CustomFilePicker'

interface StatusRowProps {
  primaryColor: string
  isVerticalList?: boolean
}

export function StatusRow({ primaryColor, isVerticalList = false }: StatusRowProps) {
  const { user } = useAuth()
  const { statuses, uploadStatus, viewStatus, deleteStatus, toggleStatusLike } = useChatV2()
  
  const [isUploading, setIsUploading] = useState(false)
  const [showFilePicker, setShowFilePicker] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [selectedUserStatus, setSelectedUserStatus] = useState<string | null>(null)

  // Group statuses by user
  const groupedStatuses = useMemo(() => {
    const groups: { [userId: string]: StatusUpdate[] } = {}
    statuses.forEach(s => {
      if (!groups[s.userId]) groups[s.userId] = []
      groups[s.userId].push(s)
    })
    return groups
  }, [statuses])

  const myStatuses = groupedStatuses[user?.uid || ''] || []
  const otherUserIds = Object.keys(groupedStatuses).filter(id => id !== user?.uid)

  const handleUpload = async () => {
    if (!pendingFile || isUploading) return
    setIsUploading(true)
    const success = await uploadStatus(pendingFile, caption)
    setIsUploading(false)
    if (success) {
      setPendingFile(null)
      setCaption('')
    } else {
      alert('Failed to upload status')
    }
  }

  const mainContent = isVerticalList ? (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* List Content */}
      <div className="flex-1 overflow-y-auto">
        {/* My Status Item */}
        <div 
          className="bg-white px-4 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
          onClick={() => myStatuses.length > 0 ? setSelectedUserStatus(user?.uid || null) : setShowFilePicker(true)}
        >
          <div className="relative">
            <div className={`p-[1px] rounded-full ${myStatuses.length > 0 ? 'border-[1.5px] border-emerald-500/60' : ''}`}>
               <div className="bg-white rounded-full p-[1px]">
                  <SyncAvatar 
                    userId={user?.uid}
                    fallbackName={user?.displayName || 'Me'}
                    bgColor={primaryColor}
                    size="w-[52px] h-[52px]"
                    className="rounded-full"
                  />
               </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowFilePicker(true);
              }}
              className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full border-[1.5px] border-white flex items-center justify-center text-white shadow-sm hover:scale-110 active:scale-95 transition-all z-10"
              style={{ width: '18px', height: '18px', minWidth: '18px', minHeight: '18px' }}
            >
               <Plus style={{ width: '10px', height: '10px' }} strokeWidth={6} />
            </button>
          </div>
          <div className="flex-1">
             <h4 className="font-bold text-[#111b21] text-[17px]">My status</h4>
             <p className="text-[14px] text-[#667781]">
               {myStatuses.length > 0 ? 'Tap to view your updates' : 'Tap to add status update'}
             </p>
          </div>
        </div>

        {/* Other Statuses List */}
        <div className="bg-white">
          {otherUserIds.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center opacity-40">
               <Camera className="w-12 h-12 mb-4 text-gray-400" />
               <p className="text-[15px] font-medium text-gray-500">No recent updates from your team</p>
            </div>
          ) : (
            <>
              {/* Filter Recent (Unseen) */}
              {(() => {
                const recentIds = otherUserIds.filter(uid => groupedStatuses[uid].some(s => !s.viewers.includes(user?.uid || '')))
                if (recentIds.length === 0) return null
                return (
                  <>
                    <div className="px-4 py-3 bg-[#f0f2f5]">
                      <span className="text-[14px] font-bold text-gray-500 uppercase tracking-wider">Recent updates</span>
                    </div>
                    {recentIds.map(userId => (
                      <StatusListItem 
                        key={userId} 
                        userId={userId} 
                        userStatuses={groupedStatuses[userId]} 
                        currentUser={user} 
                        primaryColor={primaryColor} 
                        onClick={() => setSelectedUserStatus(userId)} 
                      />
                    ))}
                  </>
                )
              })()}

              {/* Filter Viewed (Seen) */}
              {(() => {
                const viewedIds = otherUserIds.filter(uid => groupedStatuses[uid].every(s => s.viewers.includes(user?.uid || '')))
                if (viewedIds.length === 0) return null
                return (
                  <>
                    <div className="px-4 py-3 bg-[#f0f2f5]">
                      <span className="text-[14px] font-bold text-gray-500 uppercase tracking-wider">Viewed updates</span>
                    </div>
                    {viewedIds.map(userId => (
                      <StatusListItem 
                        key={userId} 
                        userId={userId} 
                        userStatuses={groupedStatuses[userId]} 
                        currentUser={user} 
                        primaryColor={primaryColor} 
                        onClick={() => setSelectedUserStatus(userId)} 
                      />
                    ))}
                  </>
                )
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-4 px-4 py-3 overflow-x-auto no-scrollbar bg-white border-b border-gray-100 shadow-sm">
      {/* My Status Bubble */}
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
        <div className="relative group cursor-pointer" onClick={() => myStatuses.length > 0 ? setSelectedUserStatus(user?.uid || null) : setShowFilePicker(true)}>
          <div className={`p-[1px] rounded-full ${myStatuses.length > 0 ? 'border-[1.5px] border-emerald-500/60' : ''}`}>
             <div className="bg-white rounded-full p-[1px]">
                <SyncAvatar 
                  userId={user?.uid}
                  fallbackName={user?.displayName || 'Me'}
                  bgColor={primaryColor}
                  size="w-[52px] h-[52px]"
                  className="rounded-full"
                />
             </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowFilePicker(true);
            }}
            className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full border-[1.5px] border-white flex items-center justify-center text-white shadow-sm hover:scale-110 active:scale-95 transition-all z-10"
            style={{ width: '18px', height: '18px', minWidth: '18px', minHeight: '18px' }}
          >
             <Plus style={{ width: '10px', height: '10px' }} strokeWidth={6} />
          </button>
        </div>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">My Status</span>
      </div>

      {/* Others' Statuses */}
      {otherUserIds.map(userId => {
        const userStatus = groupedStatuses[userId]
        if (!userStatus || userStatus.length === 0) return null
        
        const hasUnseen = userStatus.some(s => !s.viewers.includes(user?.uid || ''))
        
        return (
          <div key={userId} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div 
              className={`relative cursor-pointer p-[1px] rounded-full transition-transform active:scale-90 ${hasUnseen ? 'border-[1.5px] border-emerald-500/60 shadow-sm' : 'border-[1.5px] border-gray-200 opacity-40'}`}
              onClick={() => setSelectedUserStatus(userId)}
            >
              <div className="bg-white rounded-full p-[1px]">
                <SyncAvatar 
                  userId={userId}
                  fallbackName={userStatus[0].userName}
                  initialAvatar={userStatus[0].userAvatar}
                  bgColor={primaryColor}
                  size="w-[52px] h-[52px]"
                  className="rounded-full"
                />
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#111b21] truncate w-[60px] text-center">{userStatus[0].userName.split(' ')[0]}</span>
          </div>
        )
      })}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {mainContent}

      {/* Shared Modals & Overlays */}
      <CustomFilePicker 
        isOpen={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onSelect={(file) => {
          if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
            const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio')
            media.preload = 'metadata'
            media.onloadedmetadata = () => {
              window.URL.revokeObjectURL(media.src)
              if (media.duration > 31) {
                alert(`${file.type.startsWith('video/') ? 'Videos' : 'Audio'} must be 30 seconds or shorter!`)
                return
              }
              setPendingFile(file)
              setShowFilePicker(false)
            }
            media.src = URL.createObjectURL(file)
          } else {
            setPendingFile(file)
            setShowFilePicker(false)
          }
        }}
        primaryColor={primaryColor}
        title="Post Status"
        accept="image/*,video/*"
      />

      <AnimatePresence>
        {pendingFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black flex flex-col overflow-hidden"
          >
             {/* Background Blurred Image (Premium Feel) */}
             {pendingFile.type.startsWith('image/') && (
               <div 
                className="absolute inset-0 opacity-40 blur-3xl scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${URL.createObjectURL(pendingFile)})`, backgroundSize: 'cover' }}
               />
             )}

             {/* Top Control Bar */}
             <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent">
               <button 
                onClick={() => setPendingFile(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-all active:scale-90"
               >
                 <X className="w-6 h-6" />
               </button>
               
               <div className="flex flex-col items-end">
                  <span className="text-white font-black text-[14px] tracking-tight uppercase">Status Preview</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-white/60 text-[10px] font-bold tracking-widest uppercase">Loveworld Singers</span>
                  </div>
               </div>
             </div>

             {/* Immersive Media Content */}
             <div className="flex-1 w-full relative flex items-center justify-center p-4 z-10">
               {pendingFile.type.startsWith('image/') ? (
                 <motion.img 
                  layoutId="status-media"
                  src={URL.createObjectURL(pendingFile)} 
                  className="max-w-full max-h-[85vh] object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg" 
                 />
               ) : pendingFile.type.startsWith('video/') ? (
                 <motion.video 
                  layoutId="status-media"
                  src={URL.createObjectURL(pendingFile)} 
                  controls={false}
                  autoPlay
                  loop
                  muted
                  className="max-w-full max-h-[85vh] shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg" 
                 />
               ) : (
                  <motion.div 
                    layoutId="status-media"
                    className="w-full max-w-sm aspect-square rounded-[40px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center gap-6 shadow-2xl p-8"
                  >
                     <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md animate-pulse">
                        <Mic className="w-10 h-10 text-white" />
                     </div>
                     <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-1/3 rounded-full" />
                     </div>
                     <span className="text-white font-bold text-lg uppercase tracking-widest">Audio Status</span>
                  </motion.div>
                )}
             </div>

             {/* Floating WhatsApp-style Caption Bar */}
             <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-50">
                <div className="max-w-xl mx-auto flex items-end gap-3">
                   <div className="flex-1 relative group">
                      <textarea 
                        autoFocus
                        rows={1}
                        value={caption}
                        onChange={(e) => {
                          setCaption(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        placeholder="Add a caption..."
                        className="w-full bg-[#202c33]/90 backdrop-blur-xl text-white py-4 px-6 rounded-[28px] border border-white/10 focus:border-white/20 focus:outline-none placeholder:text-gray-400 text-[17px] resize-none max-h-[140px] transition-all shadow-2xl"
                      />
                   </div>
                   
                   <button 
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-[58px] h-[58px] rounded-full flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all disabled:opacity-50 disabled:scale-95 flex-shrink-0 hover:brightness-110"
                    style={{ backgroundColor: primaryColor }}
                   >
                     {isUploading ? (
                       <Loader2 className="w-7 h-7 animate-spin" />
                     ) : (
                       <Send className="w-7 h-7 translate-x-0.5" fill="currentColor" />
                     )}
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUserStatus && (
          <StatusViewer 
            userId={selectedUserStatus}
            statuses={groupedStatuses[selectedUserStatus]}
            onClose={() => setSelectedUserStatus(null)}
            onView={viewStatus}
            deleteStatus={deleteStatus}
            toggleStatusLike={toggleStatusLike}
            primaryColor={primaryColor}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Internal Status Viewer Component
function StatusViewer({ userId, statuses, onClose, onView, deleteStatus, toggleStatusLike, primaryColor }: { 
  userId: string, 
  statuses: StatusUpdate[], 
  onClose: () => void, 
  onView: (id: string) => void,
  deleteStatus: (id: string) => Promise<boolean>,
  toggleStatusLike: (id: string) => Promise<boolean>,
  primaryColor: string
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showViewers, setShowViewers] = useState(false)
  const { user } = useAuth()
  
  if (!statuses || statuses.length === 0) {
    onClose()
    return null
  }
  
  const currentStatus = statuses[currentIndex]
  
  React.useEffect(() => {
    if (currentStatus) {
      onView(currentStatus.id)
    }
  }, [currentIndex, currentStatus?.id])

  // Progress Bar Logic
  const [progress, setProgress] = useState(0)
  React.useEffect(() => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < statuses.length - 1) {
             setCurrentIndex(c => c + 1)
             return 0
          } else {
             onClose()
             return 100
          }
        }
        return prev + 1
      })
    }, 50) // 5 seconds total (100 * 50ms)
    return () => clearInterval(interval)
  }, [currentIndex])

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="fixed inset-0 z-[201] bg-black flex flex-col"
    >
      {/* Top Bars & User Info */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-6 flex flex-col gap-4 z-[202] bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex gap-1.5 w-full px-1">
           {statuses.map((_, i) => (
             <div key={i} className="flex-1 h-[2px] bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{ width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%' }}
                />
             </div>
           ))}
        </div>
        
        <div className="flex items-center justify-between px-1">
           <div className="flex items-center gap-3">
              <div className="p-[1.5px] rounded-full bg-white/20">
                <SyncAvatar 
                  userId={currentStatus.userId}
                  initialAvatar={currentStatus.userAvatar}
                  fallbackName={currentStatus.userName}
                  size="w-10 h-10"
                  className="rounded-full border border-black/10"
                />
              </div>
              <div className="flex flex-col">
                 <span className="text-white font-bold text-[15px] leading-tight drop-shadow-md">{currentStatus.userName}</span>
                 <span className="text-white/70 text-[11px] font-medium drop-shadow-sm flex items-center gap-2">
                   {new Date(currentStatus.timestamp?.toMillis() || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
             {currentStatus.userId === user?.uid && (
               <button 
                onClick={async () => {
                  if (confirm('Delete this status update?')) {
                    const success = await deleteStatus(currentStatus.id)
                    if (success) onClose()
                  }
                }}
                className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-white/10 rounded-full transition-all active:scale-90"
               >
                 <Trash2 className="w-5 h-5" />
               </button>
             )}
             <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-all active:scale-90">
                <X className="w-6 h-6" />
             </button>
           </div>
        </div>
      </div>

      {/* Main Content Area (Tap to nav / Swipe up for viewers) */}
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y < -100 && currentStatus.userId === user?.uid) {
            setShowViewers(true)
          }
        }}
        className="flex-1 w-full relative overflow-hidden flex items-center justify-center"
      >
        <div 
          className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer" 
          onClick={() => currentIndex > 0 ? setCurrentIndex(c => c - 1) : onClose()} 
        />
        <div 
          className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer" 
          onClick={() => currentIndex < statuses.length - 1 ? setCurrentIndex(c => c + 1) : onClose()} 
        />

        <AnimatePresence mode='wait'>
          <motion.div
            key={currentStatus.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full flex flex-col items-center justify-center p-4"
          >
             {currentStatus.type === 'image' ? (
               <img src={currentStatus.mediaUrl} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
             ) : currentStatus.type === 'video' ? (
               <video src={currentStatus.mediaUrl} autoPlay className="max-w-full max-h-full rounded-lg shadow-2xl" />
             ) : (
               <div className="w-full max-w-sm aspect-square rounded-[40px] bg-gradient-to-br from-blue-600 to-emerald-500 flex flex-col items-center justify-center gap-8 shadow-2xl p-10">
                  <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/20 relative group cursor-pointer">
                    <Music className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                    <audio src={currentStatus.mediaUrl} autoPlay className="hidden" />
                    {/* Visualizer effect */}
                    <div className="absolute -inset-4 rounded-full border border-white/10 animate-ping opacity-20" />
                  </div>
                  <div className="text-center">
                    <h5 className="text-white font-black text-xl tracking-tight mb-2">Voice Update</h5>
                    <p className="text-white/60 text-sm font-medium uppercase tracking-[0.2em]">Listening Now</p>
                  </div>
               </div>
             )}
             
             {currentStatus.caption && (
               <div className="absolute bottom-32 left-0 right-0 p-6 text-center bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-lg font-medium drop-shadow-md">{currentStatus.caption}</p>
               </div>
             )}
          </motion.div>
        </AnimatePresence>

        {/* Interaction Bar (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-30 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
           <div className="flex items-center justify-between gap-4 max-w-xl mx-auto">
              {/* Viewed Count (Bottom Right/Side) */}
              {currentStatus.userId === user?.uid ? (
                <div className="flex-1 flex justify-center">
                  <motion.button 
                    onClick={() => setShowViewers(true)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-all text-white/90">
                      <Eye className="w-5 h-5" />
                      <span className="text-[16px] font-bold">{currentStatus.viewers?.length || 0}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mt-2">Swipe up for viewers</span>
                  </motion.button>
                </div>
              ) : (
                /* Like Button (For others) */
                <div className="flex-1 flex justify-center flex-col items-center gap-2">
                   <button 
                     onClick={() => toggleStatusLike(currentStatus.id)}
                     className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all active:scale-75 shadow-2xl"
                     style={{ backgroundColor: currentStatus.likes?.includes(user?.uid || '') ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                   >
                      <Heart 
                       className="w-8 h-8" 
                       fill={currentStatus.likes?.includes(user?.uid || '') ? 'currentColor' : 'none'} 
                       color="white" 
                      />
                   </button>
                   {currentStatus.likes && currentStatus.likes.length > 0 && (
                     <span className="text-white/80 text-[13px] font-bold">{currentStatus.likes.length} Likes</span>
                   )}
                </div>
              )}
           </div>
        </div>

        {/* Viewers Drawer */}
        <AnimatePresence>
          {showViewers && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 z-[300] bg-[#f0f2f5] rounded-t-[28px] max-h-[80vh] overflow-hidden flex flex-col shadow-[0_-20px_40px_rgba(0,0,0,0.4)]"
            >
               {/* Drag Handle */}
               <div className="w-full flex justify-center py-4 cursor-pointer" onClick={() => setShowViewers(false)}>
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
               </div>

               <div className="px-6 py-2 flex items-center justify-between border-b border-gray-100 bg-white">
                  <h3 className="text-[17px] font-bold text-[#111b21]">Viewed by {currentStatus.viewers?.length || 0}</h3>
                  <button onClick={() => setShowViewers(false)} className="text-[#008069] font-bold text-[14px] uppercase tracking-wide">Close</button>
               </div>

               <div className="flex-1 overflow-y-auto bg-white">
                  {currentStatus.viewers?.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                       <p className="text-[15px]">No views yet. Share your status to get started!</p>
                    </div>
                  ) : (
                    currentStatus.viewers.map(viewerId => (
                      <ViewerItem key={viewerId} userId={viewerId} primaryColor={primaryColor} />
                    ))
                  )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

import { ChevronRight } from 'lucide-react'

// Internal Status List Item Component
function StatusListItem({ userId, userStatuses, currentUser, primaryColor, onClick }: { userId: string, userStatuses: StatusUpdate[], currentUser: any, primaryColor: string, onClick: () => void }) {
  if (!userStatuses || userStatuses.length === 0) return null
  
  const hasUnseen = userStatuses.some(s => !s.viewers.includes(currentUser?.uid || ''))
  const latest = userStatuses[userStatuses.length - 1]

  return (
    <div 
      className="px-4 py-3.5 flex items-center gap-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-all border-b border-gray-50 last:border-0"
      onClick={onClick}
    >
      <div className={`p-[1px] rounded-full ${hasUnseen ? 'border-[1.5px] border-emerald-500/60 shadow-sm' : 'border-[1.5px] border-gray-200 opacity-40'}`}>
        <div className="bg-white rounded-full p-[1px]">
          <SyncAvatar 
            userId={userId}
            fallbackName={userStatuses[0].userName}
            initialAvatar={userStatuses[0].userAvatar}
            bgColor={primaryColor}
            size="w-[48px] h-[48px]"
            className="rounded-full"
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[#111b21] truncate">{userStatuses[0].userName}</h4>
        <p className="text-[13px] text-[#667781] font-medium">
          {new Date(latest.timestamp?.toMillis() || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

function ViewerItem({ userId, primaryColor }: { userId: string, primaryColor: string }) {
  const { chats } = useChatV2()
  
  const viewerName = useMemo(() => {
    for (const chat of chats) {
      if (chat.participantDetails && chat.participantDetails[userId]) {
        return chat.participantDetails[userId].name
      }
    }
    return 'Team Member'
  }, [chats, userId])

  return (
    <div className="px-6 py-3.5 flex items-center gap-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
       <SyncAvatar 
        userId={userId}
        fallbackName={viewerName}
        bgColor={primaryColor}
        size="w-10 h-10"
        className="rounded-full"
       />
       <div className="flex-1">
          <h4 className="font-bold text-[#111b21] text-[16px]">{viewerName}</h4>
          <span className="text-[12px] text-gray-500 font-medium">Just now</span>
       </div>
    </div>
  )
}
