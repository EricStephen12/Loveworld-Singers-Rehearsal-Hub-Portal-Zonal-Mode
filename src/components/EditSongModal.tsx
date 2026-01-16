"use client";

// Smart Auto-History System - Fixed icon imports
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, FolderOpen, Clock, Plus, History, Edit } from 'lucide-react';
import { PraiseNightSong, Comment, Category } from '../types/supabase';
import MediaSelectionModal from './MediaSelectionModal';
import BasicTextEditor from './BasicTextEditor';
import { useZone } from '@/hooks/useZone';
import { isHQGroup } from '@/config/zones';
// import { createHistoryEntry, deleteHistoryEntry } from '@/lib/firebase-database-service';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { useAdminTheme } from './admin/AdminThemeProvider';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'audio' | 'video' | 'document';
  size: number;
  uploadedAt: string;
  folder?: string;
  storagePath?: string;
}

interface EditSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: PraiseNightSong | null;
  categories: Category[];
  praiseNightCategories: Array<{ id: string, name: string, description: string, date: string, location: string, icon: string, color: string, isActive: boolean, createdAt: Date, updatedAt: Date, countdown: { days: number, hours: number, minutes: number, seconds: number } }>;
  onUpdate: (updatedSong: PraiseNightSong) => void;
}

export default function EditSongModal({
  isOpen,
  onClose,
  song,
  categories,
  praiseNightCategories,
  onUpdate
}: EditSongModalProps) {
  const { theme } = useAdminTheme();
  const { currentZone } = useZone();

  // Helper function to get current user info
  const getCurrentUserName = () => {
    // Implement based on your auth system - could be from context, localStorage, etc.
    return localStorage.getItem('userName') || 'Current User';
  };

  // Theme-based CSS classes
  const inputClasses = `w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 transition-all duration-200 ${theme.focusRing} ${theme.focusBorder} focus:shadow-xl ${theme.focusBg}`;
  const buttonClasses = `flex items-center gap-2 px-4 py-3 ${theme.primary} text-white ${theme.primaryHover} rounded-lg transition-colors text-sm font-medium`;
  const historyButtonClasses = `flex items-center gap-1 px-3 py-1.5 text-xs font-medium ${theme.text} ${theme.primaryLight} ${theme.bgHover} border ${theme.border} rounded-md transition-colors`;

  // Form state
  const [songTitle, setSongTitle] = useState('');
  const [songCategory, setSongCategory] = useState('');
  const [songCategories, setSongCategories] = useState<string[]>([]);
  const [songPraiseNight, setSongPraiseNight] = useState('');
  const [songStatus, setSongStatus] = useState<'heard' | 'unheard'>('unheard');
  const [songLeadSinger, setSongLeadSinger] = useState('');
  const [songWriter, setSongWriter] = useState('');
  const [songConductor, setSongConductor] = useState('');
  const [songKey, setSongKey] = useState('');
  const [songTempo, setSongTempo] = useState('');
  const [songLeadKeyboardist, setSongLeadKeyboardist] = useState('');
  const [songLeadGuitarist, setSongLeadGuitarist] = useState('');
  const [songDrummer, setSongDrummer] = useState('');
  const [songSolfas, setSongSolfas] = useState('');
  const [songHistory, setSongHistory] = useState('');
  const [songAudioFile, setSongAudioFile] = useState('');
  const [audioFile, setAudioFile] = useState<MediaFile | null>(null);
  const [songLyrics, setSongLyrics] = useState('');
  const [songComments, setSongComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [coordinatorComment, setCoordinatorComment] = useState('');

  // History management state
  const [rehearsalCount, setRehearsalCount] = useState(0);
  const [showMediaManager, setShowMediaManager] = useState(false);

  // Get zone context to determine comment terminology (currentZone already declared above)

  // Helper function to get correct comment terminology based on zone
  const getCommentLabel = () => {
    // HQ groups see "Pastor Comment", regular zones see "Coordinator Comment"
    return isHQGroup(currentZone?.id) ? "Pastor" : "Coordinator";
  };

  // Smart change detection - track original values
  const [originalValues, setOriginalValues] = useState({
    lyrics: '',
    solfas: '',
    audioFile: '',
    title: '',
    category: '',
    leadSinger: '',
    writer: '',
    conductor: '',
    leadKeyboardist: '',
    leadGuitarist: '',
    drummer: '',
    key: '',
    tempo: ''
  });

  // Manual history creation state
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [historyType, setHistoryType] = useState<'song-details' | 'personnel' | 'music-details' | 'lyrics' | 'solfas' | 'audio' | 'comments'>('song-details');
  const [historyTitle, setHistoryTitle] = useState('');
  const [historyDescription, setHistoryDescription] = useState('');
  const [historyEntries, setHistoryEntries] = useState<any[]>([]);
  const [showHistoryList, setShowHistoryList] = useState(false);
  const [originalHistoryValues, setOriginalHistoryValues] = useState({ old_value: '', new_value: '' });
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true);

  // Manual history creation functions
  const handleCreateHistory = (type: 'song-details' | 'personnel' | 'music-details' | 'lyrics' | 'solfas' | 'audio' | 'comments') => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: 'History features require Firebase configuration. Please set up your .env.local file with Firebase credentials. See ENVIRONMENT_SETUP.md for details.',
          type: 'warning'
        }
      }));
      return;
    }

    // Reset the currentHistoryEntryId to ensure we're creating, not updating
    (window as any).currentHistoryEntryId = null;

    setHistoryType(type);

    // Set default title and description based on section
    const sectionNames = {
      'song-details': 'Song Details',
      'personnel': 'Personnel',
      'music-details': 'Music Details',
      'lyrics': 'Lyrics',
      'solfas': "Conductor's Guide",
      'audio': 'Audio',
      'comments': 'Comments'
    };

    setHistoryTitle(`${sectionNames[type]} Version ${new Date().toLocaleDateString()}`);
    setHistoryDescription(`Updated ${sectionNames[type].toLowerCase()} on ${new Date().toLocaleString()}`);

    setShowHistoryForm(true);
  };

  const handleSaveHistory = async () => {
    if (!song?.id) return;

    try {
      // Get current content based on section type
      let currentContent = '';
      let oldValue = '';

      switch (historyType) {
        case 'song-details':
          currentContent = JSON.stringify({
            title: songTitle,
            category: songCategory,
            key: songKey,
            tempo: songTempo
          });
          oldValue = JSON.stringify({
            title: originalValues.title,
            category: originalValues.category,
            key: originalValues.key,
            tempo: originalValues.tempo
          });
          break;
        case 'personnel':
          currentContent = JSON.stringify({
            leadSinger: songLeadSinger,
            writer: songWriter,
            conductor: songConductor,
            leadKeyboardist: songLeadKeyboardist,
            leadGuitarist: songLeadGuitarist,
            drummer: songDrummer
          });
          oldValue = JSON.stringify({
            leadSinger: originalValues.leadSinger,
            writer: originalValues.writer,
            conductor: originalValues.conductor,
            leadKeyboardist: originalValues.leadKeyboardist,
            leadGuitarist: originalValues.leadGuitarist,
            drummer: originalValues.drummer
          });
          break;
        case 'music-details':
          currentContent = JSON.stringify({
            key: songKey,
            tempo: songTempo
          });
          oldValue = JSON.stringify({
            key: originalValues.key,
            tempo: originalValues.tempo
          });
          break;
        case 'lyrics':
          currentContent = songLyrics;
          oldValue = originalValues.lyrics;
          break;
        case 'solfas':
          currentContent = songSolfas;
          oldValue = originalValues.solfas;
          break;
        case 'audio':
          currentContent = audioFile ? audioFile.url : songAudioFile;
          oldValue = originalValues.audioFile;
          break;
        case 'comments':
          // Save the current comment rich-text content (Pastor or Coordinator)
          currentContent = coordinatorComment;
          // Previous value: latest comment from existing song comments
          const commentAuthor = getCommentLabel();
          try {
            const latestComment = (Array.isArray(song?.comments) ? song!.comments : [])
              .filter((c: any) => c.author === commentAuthor || c.author === 'Coordinator' || c.author === 'Pastor')
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            oldValue = (latestComment as any)?.text || (latestComment as any)?.content || '';
          } catch {
            oldValue = '';
          }
          break;
      }

      const currentHistoryEntryId = (window as any).currentHistoryEntryId;

      if (currentHistoryEntryId) {
        // Use the edited historical value from the form if in edit mode
        const updateOldValue = originalHistoryValues.old_value;
        // Keep the original new_value since we're only editing the historical (old) value
        const existingEntries = await FirebaseDatabaseService.getHistoryBySongId(song.id.toString());
        const existingEntry = existingEntries.find((entry: any) => entry.id === currentHistoryEntryId);
        const updateNewValue = (existingEntry as any)?.new_value || originalHistoryValues.new_value;


        const success = await FirebaseDatabaseService.updateHistoryEntry(currentHistoryEntryId, {
          song_id: song.id.toString(), // Use string ID instead of number
          title: historyTitle,
          description: historyDescription,
          type: historyType,
          old_value: updateOldValue,
          new_value: updateNewValue,
          created_by: 'admin',
          created_at: new Date().toISOString()
        });


        (window as any).currentHistoryEntryId = null;

        if (success) {
          // Load updated history entries
          loadHistoryEntries();

          // Dispatch event to notify other components of history update
          window.dispatchEvent(new Event('historyUpdated'));

          // Close the form
          setShowHistoryForm(false);

          // Show success message
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: {
              message: 'History entry updated successfully!',
              type: 'success'
            }
          }));

          // Log activity with toast event that ActivityLogger will catch
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: {
              message: `${getCurrentUserName()} updated history for "${song.title}"`,
              type: 'info',
              zoneName: currentZone?.name,
              userName: getCurrentUserName(),
              action: 'updated',
              section: 'history',
              itemName: song.title
            }
          }));
        } else {
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: {
              message: 'Error updating history entry. Please check your Firebase configuration in .env.local file. See ENVIRONMENT_SETUP.md for details.',
              type: 'error'
            }
          }));
        }

        (window as any).currentHistoryEntryId = null;
      } else {
        // Create new history entry in Firebase

        const success = await FirebaseDatabaseService.createHistoryEntry({
          song_id: song.id.toString(), // Use string ID instead of number
          title: historyTitle,
          description: historyDescription,
          type: historyType,
          old_value: oldValue,
          new_value: currentContent,
          created_by: 'admin',
          created_at: new Date().toISOString()
        });


        if (success) {
          // Reset form but keep it open for multiple entries
          const sectionNames = {
            'song-details': 'Song Details',
            'personnel': 'Personnel',
            'music-details': 'Music Details',
            'lyrics': 'Lyrics',
            'solfas': "Conductor's Guide",
            'audio': 'Audio',
            'comments': 'Comments'
          };

          setHistoryTitle(`${sectionNames[historyType]} Version ${new Date().toLocaleDateString()}`);
          setHistoryDescription(`Updated ${sectionNames[historyType].toLowerCase()} on ${new Date().toLocaleString()}`);

          // Load updated history entries
          loadHistoryEntries();

          // Dispatch event to notify other components of history update
          window.dispatchEvent(new Event('historyUpdated'));

          if ((window as any).currentHistoryEntryId) {
            (window as any).currentHistoryEntryId = null;
            // Close the form after successful update
            setShowHistoryForm(false);
            window.dispatchEvent(new CustomEvent('showToast', {
              detail: {
                message: 'History entry updated successfully!',
                type: 'success'
              }
            }));
          } else {
            // Show success message for new entries
            window.dispatchEvent(new CustomEvent('showToast', {
              detail: {
                message: 'History entry created successfully! You can create another one or close the form.',
                type: 'success'
              }
            }));
          }
        } else {
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: {
              message: 'Error creating history entry. Please check your Firebase configuration in .env.local file. See ENVIRONMENT_SETUP.md for details.',
              type: 'error'
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error handling history entry:', error);
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: 'Error handling history entry. Please try again.',
          type: 'error'
        }
      }));
    }
  };

  // Load history entries for the current song
  const loadHistoryEntries = async () => {
    if (!song?.id) return;

    try {
      if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        console.warn('⚠️ Firebase not configured - history features will not work');
        setHistoryEntries([]);
        return;
      }

      const data = await FirebaseDatabaseService.getHistoryBySongId(song.id.toString());
      setHistoryEntries(data || []);
    } catch (error) {
      console.error('Error loading history entries:', error);
      setHistoryEntries([]);
    }
  };

  // Delete history entry
  const handleDeleteHistory = async (historyId: string) => {
    if (!confirm('Are you sure you want to delete this history entry?')) return;

    try {
      // Delete history entry from Firebase
      const success = await FirebaseDatabaseService.deleteHistoryEntry(historyId);
      if (success) {
        // Remove from local state
        setHistoryEntries(prev => prev.filter(entry => entry.id !== historyId));
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            message: 'History entry deleted successfully!',
            type: 'success'
          }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            message: 'Error deleting history entry. Please try again.',
            type: 'error'
          }
        }));
      }
    } catch (error) {
      console.error('Error deleting history entry:', error);
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: 'Error deleting history entry. Please try again.',
          type: 'error'
        }
      }));
    }
  };

  // Handle media file selection from MediaManager
  const handleMediaFileSelect = (mediaFile: any) => {

    // Supabase Storage URLs work directly - no CORS issues!
    let fixedUrl = mediaFile.url;

    setSongAudioFile(fixedUrl);
    setAudioFile({ ...mediaFile, url: fixedUrl }); // Store with fixed URL
    setShowMediaManager(false);
  };

  // Helper function to convert HTML to plain text
  const htmlToPlainText = (html: string) => {
    if (!html) return '';
    // Create a temporary div to parse HTML and extract text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Helper function to convert plain text to HTML (preserve line breaks)
  const plainTextToHtml = (text: string) => {
    if (!text) return '';
    return text.replace(/\n/g, '<br>');
  };

  // Helper function to handle paste events and preserve formatting
  const handlePaste = (e: React.ClipboardEvent, currentValue: string, setValue: (value: string) => void) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || (window as any).clipboardData;

    // Try to get HTML content first (preserves formatting)
    let htmlContent = clipboardData.getData('text/html');
    const plainText = clipboardData.getData('text/plain') || clipboardData.getData('text');

    if (htmlContent) {
      // Clean the HTML while preserving formatting
      const cleanHtml = cleanPastedHtml(htmlContent);
      setValue(cleanHtml);
    } else if (plainText) {
      // Fallback to plain text with line breaks preserved
      const textWithBreaks = plainText.replace(/\n/g, '<br>');
      setValue(textWithBreaks);
    }
  };

  // Helper function to clean pasted HTML while preserving formatting
  const cleanPastedHtml = (html: string): string => {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove unwanted attributes but keep formatting tags
    const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const allowedAttributes = ['style'];

    const cleanNode = (node: Node): Node | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.cloneNode(true);
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();

        if (allowedTags.includes(tagName)) {
          const newElement = document.createElement(tagName);

          // Copy allowed attributes
          allowedAttributes.forEach(attr => {
            if (element.hasAttribute(attr)) {
              newElement.setAttribute(attr, element.getAttribute(attr) || '');
            }
          });

          // Copy style attribute but clean it
          if (element.hasAttribute('style')) {
            const style = element.getAttribute('style') || '';
            // Keep only safe CSS properties
            const safeStyle = style
              .split(';')
              .filter(prop => {
                const [property] = prop.split(':');
                return ['font-weight', 'font-style', 'text-decoration', 'color', 'background-color'].includes(property.trim());
              })
              .join(';');
            if (safeStyle) {
              newElement.setAttribute('style', safeStyle);
            }
          }

          // Process child nodes
          Array.from(element.childNodes).forEach(child => {
            const cleanedChild = cleanNode(child);
            if (cleanedChild) {
              newElement.appendChild(cleanedChild);
            }
          });

          return newElement;
        } else {
          // For disallowed tags, just return the text content
          return document.createTextNode(element.textContent || '');
        }
      }

      return null;
    };

    const cleanedNode = cleanNode(tempDiv);
    return cleanedNode && 'innerHTML' in cleanedNode ? (cleanedNode as Element).innerHTML : html;
  };

  // Initialize form when song changes
  useEffect(() => {
    if (song) {

      // Editing existing song - populate form with song data
      setSongTitle(song.title || '');
      setSongCategory(song.category || '');
      // Initialize categories from existing song data
      if (song.categories && Array.isArray(song.categories)) {
        setSongCategories(song.categories);
      } else if (song.category) {
        // Fallback: convert single category to array for backward compatibility
        setSongCategories([song.category]);
      } else {
        setSongCategories([]);
      }
      // Find the praise night name from the praiseNightId
      const praiseNight = praiseNightCategories.find(pn => pn.id === song.praiseNightId);
      setSongPraiseNight(praiseNight?.name || '');
      setSongStatus(song.status);
      setSongLeadSinger(song.leadSinger || '');
      setSongWriter(song.writer || '');
      setSongConductor(song.conductor || '');
      setSongKey(song.key || '');
      setSongTempo(song.tempo || '');
      setSongLeadKeyboardist(song.leadKeyboardist || '');
      setSongLeadGuitarist(song.leadGuitarist || '');
      setSongDrummer(song.drummer || '');
      setSongHistory('');
      setSongAudioFile(song.audioFile || '');
      setAudioFile(null); // Reset file object when editing existing song

      // Use HTML directly for BasicTextEditor
      setSongLyrics(song.lyrics || '');
      setSongSolfas(song.solfas || '');

      setSongComments(Array.isArray(song.comments) ? song.comments : []);
      setNewComment('');
      // Initialize comment editor from latest comment (Pastor or Coordinator)
      try {
        const commentAuthor = getCommentLabel();
        const latestComment = (Array.isArray(song.comments) ? song.comments : [])
          .filter(c => c.author === commentAuthor || c.author === 'Coordinator' || c.author === 'Pastor')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        setCoordinatorComment((latestComment as any)?.text || (latestComment as any)?.content || '');
      } catch { }

      // Load rehearsal count from song data, default to 0 if not set
      setRehearsalCount(song.rehearsalCount ?? 0);

      // Store original values for change detection
      setOriginalValues({
        lyrics: song.lyrics || '',
        solfas: song.solfas || '',
        audioFile: song.audioFile || '',
        title: song.title || '',
        category: song.category || '',
        leadSinger: song.leadSinger || '',
        writer: song.writer || '',
        conductor: song.conductor || '',
        leadKeyboardist: song.leadKeyboardist || '',
        leadGuitarist: song.leadGuitarist || '',
        drummer: song.drummer || '',
        key: song.key || '',
        tempo: song.tempo || ''
      });
    } else {
      // Adding new song - reset all form fields to empty/default values
      setSongTitle('');
      setSongCategory('');
      setSongCategories([]);
      // Set default praise night to the first available one
      setSongPraiseNight(praiseNightCategories.length > 0 ? praiseNightCategories[0].name : '');
      setSongStatus('unheard');
      setSongLeadSinger('');
      setSongWriter('');
      setSongConductor('');
      setSongKey('');
      setSongTempo('');
      setSongLeadKeyboardist('');
      setSongLeadGuitarist('');
      setSongDrummer('');
      setSongSolfas('');
      setSongHistory('');
      setSongAudioFile('');
      setAudioFile(null);
      setSongLyrics('');
      setSongComments([]);
      setNewComment('');
      setCoordinatorComment('');
      setRehearsalCount(0);

      // Reset original values for new song
      setOriginalValues({
        lyrics: '',
        solfas: '',
        audioFile: '',
        title: '',
        category: '',
        leadSinger: '',
        writer: '',
        conductor: '',
        leadKeyboardist: '',
        leadGuitarist: '',
        drummer: '',
        key: '',
        tempo: ''
      });

      setHistoryEntries([]);
    }

    // Load history entries when song is available
    if (song?.id) {
      loadHistoryEntries();
    }
  }, [song]);

  useEffect(() => {
    setOriginalValues({
      lyrics: songLyrics,
      solfas: songSolfas,
      audioFile: songAudioFile,
      title: songTitle,
      category: songCategory,
      leadSinger: songLeadSinger,
      writer: songWriter,
      conductor: songConductor,
      leadKeyboardist: songLeadKeyboardist,
      leadGuitarist: songLeadGuitarist,
      drummer: songDrummer,
      key: songKey,
      tempo: songTempo
    });
  }, [songTitle, songCategory, songKey, songTempo, songLyrics, songSolfas, songAudioFile,
    songLeadSinger, songWriter, songConductor, songLeadKeyboardist, songLeadGuitarist, songDrummer]);

  const handleUpdate = async () => {
    if (songTitle.trim()) {
      // Find the selected Praise Night ID
      const selectedPraiseNight = praiseNightCategories.find(pn => pn.name === songPraiseNight);


      if (!selectedPraiseNight) {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            message: 'Please select a valid Praise Night',
            type: 'warning'
          }
        }));
        return;
      }


      const finalAudioFile = audioFile ? audioFile.url : songAudioFile;

      const finalComments = coordinatorComment && coordinatorComment.trim() !== '' ? [
        {
          id: `comment-${Date.now()}`,
          text: coordinatorComment,
          date: new Date().toISOString(),
          author: getCommentLabel() // Dynamic: "Pastor" for HQ groups, "Coordinator" for zones
        }
      ] : [];

      const songData: PraiseNightSong = {
        title: songTitle.trim(),
        status: songStatus,
        category: songCategory, // Keep for backward compatibility
        categories: songCategories, // New multi-category support
        praiseNightId: selectedPraiseNight?.id,
        lyrics: songLyrics, // BasicTextEditor provides HTML
        leadSinger: songLeadSinger,
        writer: songWriter,
        conductor: songConductor,
        key: songKey,
        tempo: songTempo,
        leadKeyboardist: songLeadKeyboardist,
        leadGuitarist: songLeadGuitarist,
        drummer: songDrummer,
        solfas: songSolfas, // BasicTextEditor provides HTML
        rehearsalCount: rehearsalCount, // Save rehearsal count to database
        comments: finalComments,
        audioFile: finalAudioFile,
        // Only include mediaId if it exists (Firebase doesn't allow undefined values)
        ...(audioFile && { mediaId: parseInt(audioFile.id) }),
        // Preserve existing history array
        history: song?.history || []
      };


      // If editing existing song, preserve other properties including history
      let updatedSong = song ? { ...song, ...songData } : songData;


      // Pass the song ID if editing an existing song

      // Create history entry before saving
      if (song && song.id) {

        // Compare current values with original values to detect changes
        const hasChanges =
          songTitle !== originalValues.title ||
          songCategory !== originalValues.category ||
          songKey !== originalValues.key ||
          songTempo !== originalValues.tempo ||
          songLyrics !== originalValues.lyrics ||
          songSolfas !== originalValues.solfas ||
          finalAudioFile !== originalValues.audioFile ||
          songLeadSinger !== originalValues.leadSinger ||
          songWriter !== originalValues.writer ||
          songConductor !== originalValues.conductor ||
          songLeadKeyboardist !== originalValues.leadKeyboardist ||
          songLeadGuitarist !== originalValues.leadGuitarist ||
          songDrummer !== originalValues.drummer;

        if (hasChanges) {
          // Create history entry for the changes
          const historyEntry = {
            song_id: song.id.toString(),
            title: `Update - ${new Date().toLocaleDateString()}`,
            description: 'Automatic history entry for changes made',
            type: 'all-fields',
            old_value: JSON.stringify({
              title: originalValues.title,
              category: originalValues.category,
              key: originalValues.key,
              tempo: originalValues.tempo,
              lyrics: originalValues.lyrics,
              solfas: originalValues.solfas,
              audioFile: originalValues.audioFile,
              leadSinger: originalValues.leadSinger,
              writer: originalValues.writer,
              conductor: originalValues.conductor,
              leadKeyboardist: originalValues.leadKeyboardist,
              leadGuitarist: originalValues.leadGuitarist,
              drummer: originalValues.drummer
            }),
            new_value: JSON.stringify({
              title: songTitle,
              category: songCategory,
              key: songKey,
              tempo: songTempo,
              lyrics: songLyrics,
              solfas: songSolfas,
              audioFile: finalAudioFile,
              leadSinger: songLeadSinger,
              writer: songWriter,
              conductor: songConductor,
              leadKeyboardist: songLeadKeyboardist,
              leadGuitarist: songLeadGuitarist,
              drummer: songDrummer
            }),
            created_by: 'user',
            created_at: new Date().toISOString()
          };

          try {
            // Save history entry to Firebase
            const historySuccess = await FirebaseDatabaseService.createHistoryEntry(historyEntry);

            // Reload history entries to show the new one
            if (historySuccess) {
              loadHistoryEntries();
            }
          } catch (error) {
            console.error('Error saving history entry:', error);
          }
        }

        // Use firebaseId for Firebase operations, keep numeric id for UI compatibility
        const updateData = {
          ...updatedSong,
          id: song.id, // Keep numeric id for UI
          firebaseId: song.firebaseId // Use firebaseId for Firebase operations
        };

        onUpdate(updateData);
      } else {
        onUpdate(updatedSong);
      }

      // Log activity for song update
      if (typeof window !== 'undefined' && song && updatedSong) {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            message: `Updated song: "${updatedSong.title}"`,
            type: 'success',
            userName: getCurrentUserName(),
            action: 'updated',
            section: 'songs',
            itemName: updatedSong.title
          }
        }));
      }

      onClose();
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        text: newComment.trim(),
        date: new Date().toISOString(),
        author: 'Coordinator'
      };
      setSongComments([...(Array.isArray(songComments) ? songComments : []), comment]);
      setNewComment('');
    }
  };


  const handleDeleteComment = (commentId: string) => {
    setSongComments((Array.isArray(songComments) ? songComments : []).filter(comment => comment.id !== commentId));
  };

  if (!isOpen) {
    return null;
  }

  // Don't render form until song data is properly loaded (for editing mode)
  // Only check this for existing songs (has id), not for new songs
  if (song && song.id && !song.title) {
    return null;
  }


  return (
    <>
      <style jsx>{`
        .hide-toolbar {
          display: none !important;
        }
      `}</style>

      <div className="fixed inset-0 bg-white z-50 flex flex-col w-screen h-screen">
        <div className="bg-white w-full h-full overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 flex-shrink-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-outfit-semibold text-slate-900 truncate">
              {song ? `Edit Song: ${song.title}` : 'Add New Song'}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 -mr-2"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="w-full p-3 sm:p-4 lg:p-6">

              {/* Main Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">

                {/* Left Column - Basic Info */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">

                  {/* Song Title - Full Width */}
                  <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900">Song Details</h4>
                      <button
                        onClick={() => handleCreateHistory('song-details')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors"
                      >
                        <History className="w-3 h-3" />
                        Add History
                      </button>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Song Title *
                        </label>
                        <input
                          type="text"
                          value={songTitle}
                          onChange={(e) => setSongTitle(e.target.value)}
                          onPaste={(e) => handlePaste(e, songTitle, setSongTitle)}
                          dir="ltr"
                          style={{ textAlign: 'left', direction: 'ltr' }}
                          className={`${inputClasses} text-lg font-medium`}
                          placeholder="Enter song title"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Categories * (Select one or more)
                          </label>
                          <div className="border-2 border-slate-300 rounded-lg p-3 bg-slate-50 max-h-48 overflow-y-auto">
                            {categories.map(category => (
                              <label key={category.id} className="flex items-center space-x-3 py-2 hover:bg-slate-100 rounded px-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={songCategories.includes(category.name)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const newCategories = [...songCategories, category.name];
                                      setSongCategories(newCategories);
                                      // Also update single category for backward compatibility (use first selected)
                                      setSongCategory(newCategories[0] || '');
                                    } else {
                                      const newCategories = songCategories.filter(cat => cat !== category.name);
                                      setSongCategories(newCategories);
                                      setSongCategory(newCategories[0] || '');
                                    }
                                  }}
                                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 focus:ring-2"
                                />
                                <span className="text-sm text-slate-700">{category.name}</span>
                              </label>
                            ))}
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            Selected: {songCategories.length > 0 ? songCategories.join(', ') : 'None'}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Status
                          </label>
                          <select
                            value={songStatus}
                            onChange={(e) => setSongStatus(e.target.value as 'heard' | 'unheard')}
                            className={inputClasses}
                          >
                            <option value="heard">Heard</option>
                            <option value="unheard">Unheard</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Praise Night
                        </label>
                        <select
                          value={songPraiseNight}
                          onChange={(e) => setSongPraiseNight(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                        >
                          <option value="">Select Praise Night</option>
                          {praiseNightCategories.map(praiseNight => (
                            <option key={praiseNight.id} value={praiseNight.name}>{praiseNight.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Music Details */}
                  <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900">Music Details</h4>
                      <button
                        onClick={() => handleCreateHistory('music-details')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors"
                      >
                        <History className="w-3 h-3" />
                        Add History
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Key
                        </label>
                        <input
                          type="text"
                          value={songKey}
                          onChange={(e) => setSongKey(e.target.value)}
                          onPaste={(e) => handlePaste(e, songKey, setSongKey)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="e.g., C, G, F#"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Tempo
                        </label>
                        <input
                          type="text"
                          value={songTempo}
                          onChange={(e) => setSongTempo(e.target.value)}
                          onPaste={(e) => handlePaste(e, songTempo, setSongTempo)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="e.g., 120 BPM"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Rehearsal Count (Manual)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={rehearsalCount}
                          onChange={(e) => setRehearsalCount(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter rehearsal count manually"
                        />
                      </div>
                    </div>

                    {/* Audio File - Full Width */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Audio File
                        </label>
                        <button
                          onClick={() => handleCreateHistory('audio')}
                          className={historyButtonClasses}
                        >
                          <History className="w-3 h-3" />
                          Add History
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMediaManager(true)}
                        className={buttonClasses}
                      >
                        <FolderOpen className="w-4 h-4" />
                        Browse Media Library
                      </button>
                      {audioFile && (
                        <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></span>
                              <span className="text-sm font-medium text-slate-700 break-all" title={audioFile.name}>
                                {audioFile.name}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 ml-4">
                              ({audioFile.size ? `${(audioFile.size / 1024 / 1024).toFixed(2)} MB` : 'From Media Library'})
                            </span>
                          </div>
                          <audio
                            controls
                            className="w-full h-8"
                            style={{ outline: 'none' }}
                          >
                            <source src={audioFile.url} type="audio/mpeg" />
                            <source src={audioFile.url} type="audio/wav" />
                            <source src={audioFile.url} type="audio/ogg" />
                            <source src={audioFile.url} type="audio/mp4" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                      {/* Current Audio Display */}
                      <div className="mt-3">
                        {songAudioFile && !audioFile ? (
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                                <span className="text-sm font-medium text-slate-700">Current Audio:</span>
                              </div>
                              <button
                                onClick={() => {
                                  setSongAudioFile('');
                                  setAudioFile(null);
                                }}
                                className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded border border-red-200 hover:border-red-300 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="text-sm text-slate-600 break-all mb-3" title={songAudioFile}>
                              {songAudioFile.split('/').pop() || songAudioFile}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              Source: {songAudioFile}
                            </div>
                            <audio
                              controls
                              className="w-full h-8"
                              style={{ outline: 'none' }}
                              preload="metadata"
                            >
                              <source src={songAudioFile} type="audio/mpeg" />
                              <source src={songAudioFile} type="audio/wav" />
                              <source src={songAudioFile} type="audio/ogg" />
                              <source src={songAudioFile} type="audio/mp4" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ) : !songAudioFile && !audioFile ? (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                            <div className="text-gray-500 text-sm">
                              No audio file selected
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Click "Browse Media Library" to select an audio file
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Personnel */}
                  <div className="bg-slate-50 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900">Personnel</h4>
                      <button
                        onClick={() => handleCreateHistory('personnel')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors"
                      >
                        <History className="w-3 h-3" />
                        Add History
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Lead Singer
                        </label>
                        <input
                          type="text"
                          value={songLeadSinger}
                          onChange={(e) => setSongLeadSinger(e.target.value)}
                          onPaste={(e) => handlePaste(e, songLeadSinger, setSongLeadSinger)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter lead singer name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Writer
                        </label>
                        <input
                          type="text"
                          value={songWriter}
                          onChange={(e) => setSongWriter(e.target.value)}
                          onPaste={(e) => handlePaste(e, songWriter, setSongWriter)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter writer name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Conductor
                        </label>
                        <input
                          type="text"
                          value={songConductor}
                          onChange={(e) => setSongConductor(e.target.value)}
                          onPaste={(e) => handlePaste(e, songConductor, setSongConductor)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter conductor name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Lead Keyboardist
                        </label>
                        <input
                          type="text"
                          value={songLeadKeyboardist}
                          onChange={(e) => setSongLeadKeyboardist(e.target.value)}
                          onPaste={(e) => handlePaste(e, songLeadKeyboardist, setSongLeadKeyboardist)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter lead keyboardist name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Bass Guitarist
                        </label>
                        <input
                          type="text"
                          value={songLeadGuitarist}
                          onChange={(e) => setSongLeadGuitarist(e.target.value)}
                          onPaste={(e) => handlePaste(e, songLeadGuitarist, setSongLeadGuitarist)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter bass guitarist name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Drummer
                        </label>
                        <input
                          type="text"
                          value={songDrummer}
                          onChange={(e) => setSongDrummer(e.target.value)}
                          onPaste={(e) => handlePaste(e, songDrummer, setSongDrummer)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                          placeholder="Enter drummer name"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Lyrics and Comments */}
                <div className="lg:col-span-3 space-y-4 sm:space-y-6">

                  {/* Lyrics Section */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Song Lyrics
                        </h4>
                        <button
                          onClick={() => handleCreateHistory('lyrics')}
                          className={historyButtonClasses}
                        >
                          <History className="w-3 h-3" />
                          Add History
                        </button>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6">
                      {/* Rich Text Editor with formatting toolbar */}
                      <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                        Rich text editor - Use the toolbar above to format your lyrics
                      </div>

                      <div className="relative">
                        <BasicTextEditor
                          id="lyrics-editor"
                          value={songLyrics}
                          onChange={(value) => {
                            setSongLyrics(value);
                          }}
                          placeholder="Enter complete song lyrics here...

Example:
Verse 1:
[Your verse lyrics here]

Chorus:
[Your chorus lyrics here]

Verse 2:
[Your verse lyrics here]

Bridge:
[Your bridge lyrics here]"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Conductor's Guide Section */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Conductor's Guide Notation
                        </h4>
                        <button
                          onClick={() => handleCreateHistory('solfas')}
                          className={historyButtonClasses}
                        >
                          <History className="w-3 h-3" />
                          Add History
                        </button>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6">
                      {/* Rich Text Editor with formatting toolbar */}
                      <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                        Rich text editor - Use the toolbar above to format your solfas
                      </div>

                      <div className="relative">
                        <BasicTextEditor
                          id="solfas-editor"
                          value={songSolfas}
                          onChange={(value) => {
                            setSongSolfas(value);
                          }}
                          placeholder="Enter solfas notation here...

Example:
Do Re Mi Fa Sol La Ti Do
Do Re Mi Fa Sol La Ti Do
Do Ti La Sol Fa Mi Re Do

Chorus:
Do Re Mi Fa Sol La Ti Do
Do Re Mi Fa Sol La Ti Do"
                          className="w-full font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          {getCommentLabel()} Comment
                        </h4>
                        <button
                          onClick={() => handleCreateHistory('comments')}
                          className={historyButtonClasses}
                        >
                          <History className="w-3 h-3" />
                          Save Version
                        </button>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                        Basic rich text - Bold and Italic supported
                      </div>
                      <BasicTextEditor
                        id="coordinator-comment-editor"
                        value={coordinatorComment}
                        onChange={(value) => setCoordinatorComment(value)}
                        placeholder={`Enter ${getCommentLabel()}'s comment here...`}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 border-t border-slate-200 flex-shrink-0">
            <button
              onClick={handleUpdate}
              className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 ${theme.primary} text-white ${theme.primaryHover} rounded-lg transition-colors font-medium`}
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{song ? 'Update Song' : 'Add Song'}</span>
            </button>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
                    window.dispatchEvent(new CustomEvent('showToast', {
                      detail: {
                        message: 'History features require Firebase configuration. Please set up your .env.local file with Firebase credentials. See ENVIRONMENT_SETUP.md for details.',
                        type: 'warning'
                      }
                    }));
                    return;
                  }
                  loadHistoryEntries();
                  setShowHistoryList(true);
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium relative ${!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : `${theme.primary} text-white ${theme.primaryHover}`
                  }`}
                disabled={!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}
              >
                <History className="w-4 h-4" />
                <span className="text-sm sm:text-base">View History</span>
                {historyEntries.length > 0 && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {historyEntries.length}
                  </span>
                )}
                {!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" title="Firebase not configured">
                    ⚠️
                  </span>
                )}
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>

        </div>
      </div>

      <MediaSelectionModal
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        onFileSelect={handleMediaFileSelect}
        allowedTypes={['audio']}
        title="Select Audio File"
      />

      {/* Simple History Creation Modal */}
      {showHistoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {(window as any).currentHistoryEntryId ? 'Update History Entry' : `Save ${historyType.charAt(0).toUpperCase() + historyType.slice(1)} Version`}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {(window as any).currentHistoryEntryId ? 'Update the selected history entry' : `Create a history entry for the current ${historyType} content`}
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Version Title
                </label>
                <input
                  type="text"
                  value={historyTitle}
                  onChange={(e) => setHistoryTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Lyrics Version 1.2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <select
                  value={historyType}
                  onChange={(e) => setHistoryType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="song-details">Song Details</option>
                  <option value="personnel">Personnel</option>
                  <option value="music-details">Music Details</option>
                  <option value="lyrics">Lyrics</option>
                  <option value="solfas">Solfas</option>
                  <option value="audio">Audio</option>
                  <option value="comments">Comments</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={historyDescription}
                  onChange={(e) => setHistoryDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="What changed in this version?"
                />
              </div>

              {(window as any).currentHistoryEntryId && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Historical Value
                    </label>
                    {/* For audio type, show audio player instead of textarea */}
                    {historyType === 'audio' ? (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        {originalHistoryValues.new_value ? (
                          <audio
                            controls
                            className="w-full"
                            src={originalHistoryValues.new_value}
                          >
                            Your browser does not support the audio element.
                          </audio>
                        ) : (
                          <p className="text-sm text-slate-400 italic">No audio file in history</p>
                        )}
                      </div>
                    ) : (historyType === 'song-details' || historyType === 'personnel' || historyType === 'music-details') ? (
                      // For structured data types, show all fields in a formatted way
                      <div className="space-y-3">
                        {(() => {
                          try {
                            const parsed = JSON.parse(originalHistoryValues.old_value || '{}');
                            if (typeof parsed !== 'object') return null;

                            const fields: { label: string; key: string }[] = [];

                            if (historyType === 'song-details') {
                              fields.push(
                                { label: 'Title', key: 'title' },
                                { label: 'Category', key: 'category' },
                                { label: 'Key', key: 'key' },
                                { label: 'Tempo', key: 'tempo' }
                              );
                            } else if (historyType === 'personnel') {
                              fields.push(
                                { label: 'Lead Singer', key: 'leadSinger' },
                                { label: 'Writer', key: 'writer' },
                                { label: 'Conductor', key: 'conductor' },
                                { label: 'Lead Keyboardist', key: 'leadKeyboardist' },
                                { label: 'Bass Guitarist', key: 'leadGuitarist' },
                                { label: 'Drummer', key: 'drummer' }
                              );
                            } else if (historyType === 'music-details') {
                              fields.push(
                                { label: 'Key', key: 'key' },
                                { label: 'Tempo', key: 'tempo' }
                              );
                            }

                            return fields.map(field => (
                              <div key={field.key}>
                                <label className="block text-xs font-medium text-slate-600 mb-1">{field.label}</label>
                                <input
                                  type="text"
                                  value={parsed[field.key] || ''}
                                  onChange={(e) => {
                                    const updated = { ...parsed, [field.key]: e.target.value };
                                    setOriginalHistoryValues({
                                      ...originalHistoryValues,
                                      old_value: JSON.stringify(updated)
                                    });
                                  }}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder={`Enter ${field.label.toLowerCase()}`}
                                />
                              </div>
                            ));
                          } catch {
                            return <p className="text-sm text-slate-400">Unable to parse history data</p>;
                          }
                        })()}
                      </div>
                    ) : (
                      <textarea
                        value={(() => {
                          if (!originalHistoryValues) {
                            console.warn('originalHistoryValues is not set for textarea');
                            return '';
                          }

                          try {
                            // Try to parse as JSON, otherwise return as string
                            const parsed = JSON.parse(originalHistoryValues.old_value || '{}');

                            // For lyrics, solfas, comments - convert HTML to readable text
                            const rawValue = typeof parsed === 'string' ? parsed : originalHistoryValues.old_value || '';
                            return rawValue
                              .replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n\n')
                              .replace(/<br\s*\/?>/gi, '\n')
                              .replace(/<b>(.*?)<\/b>/gi, '**$1**')
                              .replace(/<[^>]*>/g, '')
                              .trim();
                          } catch {
                            // If parsing fails, convert HTML to readable text
                            const rawValue = originalHistoryValues.old_value || '';
                            return rawValue
                              .replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n\n')
                              .replace(/<br\s*\/?>/gi, '\n')
                              .replace(/<b>(.*?)<\/b>/gi, '**$1**')
                              .replace(/<[^>]*>/g, '')
                              .trim();
                          }
                        })()}
                        onChange={(e) => {
                          // For lyrics, solfas, comments - convert readable format back to HTML for saving
                          let convertedValue = e.target.value;
                          const paragraphs = convertedValue.split('\n\n');
                          convertedValue = paragraphs
                            .filter(p => p.trim() !== '')
                            .map(p => `<div>${p.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</div>`)
                            .join('');
                          setOriginalHistoryValues({ ...originalHistoryValues, old_value: convertedValue });
                        }}
                        className="w-full px-3 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        rows={8}
                        placeholder="Historical value to edit"
                      />
                    )}
                  </div>

                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>
                    {(window as any).currentHistoryEntryId
                      ? 'History entry will be updated with your changes.'
                      : `Current ${historyType} content will be saved as a new version.`}
                  </strong>
                  <br />
                  You can {(window as any).currentHistoryEntryId ? 'update' : 'create'} multiple versions and switch between them later.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Reset the currentHistoryEntryId when closing the form
                    (window as any).currentHistoryEntryId = null;
                    setShowHistoryForm(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSaveHistory();
                    // Reset the currentHistoryEntryId after saving
                    setTimeout(() => {
                      (window as any).currentHistoryEntryId = null;
                    }, 100); // Small delay to ensure save completes
                    setShowHistoryForm(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History List Modal */}
      {showHistoryList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Song History - {song?.title}
                </h3>
                <button
                  onClick={() => setShowHistoryList(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {historyEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No history entries found for this song.</p>
                  <p className="text-sm">Create your first history entry using the "Add History" buttons.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyEntries.map((entry) => (
                    <div key={entry.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {entry.type}
                            </span>
                            <span className="text-sm text-slate-500">
                              {new Date(entry.created_at).toLocaleString()}
                            </span>
                          </div>
                          <h4 className="font-medium text-slate-900 mb-1">{entry.title}</h4>
                          <p className="text-sm text-slate-600 mb-2">{entry.description}</p>
                          <div className="text-xs text-slate-500">
                            Created by: {entry.created_by}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              // Edit this history entry
                              setHistoryTitle(entry.title);
                              setHistoryDescription(entry.description);
                              setHistoryType(entry.type);
                              // Store original values for editing
                              setOriginalHistoryValues({
                                old_value: entry.old_value || '',
                                new_value: entry.new_value || ''
                              });
                              setShowHistoryForm(true);
                              // Store the entry ID for updating
                              (window as any).currentHistoryEntryId = entry.id;
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Edit history entry"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHistory(entry.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete history entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setShowHistoryList(false)}
                className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
