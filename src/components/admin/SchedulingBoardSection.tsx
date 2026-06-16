"use client";

import React, { useState } from 'react';
import { Loader2, Plus, Clock, Archive, ArrowLeft, Trash2, Edit2 } from 'lucide-react';
import { useSchedulingBoard } from '@/hooks/useSchedulingBoard';

const TABS = [
  { id: 'schedule', label: 'Daily Schedule' },
  { id: 'new', label: 'New Songs' },
  { id: 'carried', label: 'Carried Over' },
  { id: 'swapped', label: 'Swapped' },
  { id: 'renamed', label: 'Name Changes' },
  { id: 'invalid', label: 'Invalid' },
  { id: 'eligibility', label: 'Eligibility' },
];

export default function SchedulingBoardSection() {
  const {
    loading, canEdit, viewHistory, setViewHistory,
    programs, activeProgramId, setActiveProgramId, activeProgram,
    createProgram, updateProgramData, toggleArchive, deleteActiveProgram, renameActiveProgram, currentZone
  } = useSchedulingBoard();

  const [activeTab, setActiveTab] = useState('schedule');
  const [showCreateProg, setShowCreateProg] = useState(false);
  const [newProgName, setNewProgName] = useState('');

  const [showEditProg, setShowEditProg] = useState(false);
  const [editProgName, setEditProgName] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const themeColor = currentZone?.themeColor || '#9333ea';

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;
  }

  const getArrayNameForTab = (tab: string) => {
    switch(tab) {
      case 'schedule': return 'dailySchedules';
      case 'new': return 'newSongs';
      case 'carried': return 'carriedOver';
      case 'swapped': return 'swapped';
      case 'renamed': return 'nameChanges';
      case 'invalid': return 'invalidSongs';
      case 'eligibility': return 'submitters';
      default: return '';
    }
  };

  const handleSaveItem = async () => {
    if (!activeProgram) return;
    const arrayName = getArrayNameForTab(activeTab);
    const currentArray = (activeProgram as any)[arrayName] || [];
    
    let updatedArray;
    if (editingItemId) {
      updatedArray = currentArray.map((i: any) => i.id === editingItemId ? { ...i, ...formData } : i);
    } else {
      const newItem = { id: Date.now().toString(), ...formData };
      updatedArray = [...currentArray, newItem];
    }
    
    await updateProgramData({ [arrayName]: updatedArray });
    setShowAddModal(false);
    setFormData({});
    setEditingItemId(null);
  };

  const handleDeleteItem = async (itemId: string, arrayName: string) => {
    if (!activeProgram || !confirm('Delete this item?')) return;
    const currentArray = (activeProgram as any)[arrayName] || [];
    await updateProgramData({ [arrayName]: currentArray.filter((i: any) => i.id !== itemId) });
  };

  const renderAddForm = () => {
    if (activeTab === 'schedule') return (
      <>
        <div className="flex gap-4">
          <input className="flex-1 p-2 border rounded" placeholder="Time (e.g. 09:00)" value={formData.time || ''} onChange={e=>setFormData({...formData, time: e.target.value})} />
          <input className="flex-[2] p-2 border rounded" placeholder="Song/Event Title" value={formData.title || ''} onChange={e=>setFormData({...formData, title: e.target.value})} />
        </div>
        <div className="flex gap-4 mt-4">
          <input className="flex-1 p-2 border rounded" placeholder="Key (e.g. Bb)" value={formData.key || ''} onChange={e=>setFormData({...formData, key: e.target.value})} />
          <input className="flex-1 p-2 border rounded" type="number" placeholder="Mins (e.g. 20)" value={formData.allotment || ''} onChange={e=>setFormData({...formData, allotment: parseInt(e.target.value) || 0})} />
          <select className="flex-1 p-2 border rounded" value={formData.status || 'not-rehearsed'} onChange={e=>setFormData({...formData, status: e.target.value})}>
            <option value="not-rehearsed">Pending</option>
            <option value="rehearsed">Rehearsed</option>
            <option value="break">Break</option>
          </select>
        </div>
        <input className="w-full mt-4 p-2 border rounded" placeholder="Notes (Optional)" value={formData.note || ''} onChange={e=>setFormData({...formData, note: e.target.value})} />
      </>
    );

    if (activeTab === 'new') return (
      <>
        <input className="w-full mb-4 p-2 border rounded" placeholder="Song Title" value={formData.title || ''} onChange={e=>setFormData({...formData, title: e.target.value})} />
        <div className="flex gap-4 mb-4">
          <input className="flex-1 p-2 border rounded" placeholder="Key" value={formData.key || ''} onChange={e=>setFormData({...formData, key: e.target.value})} />
          <input className="flex-1 p-2 border rounded" placeholder="Duration (e.g. 4:20)" value={formData.duration || ''} onChange={e=>setFormData({...formData, duration: e.target.value})} />
        </div>
        <input className="w-full mb-4 p-2 border rounded" placeholder="Submitted By" value={formData.submittedBy || ''} onChange={e=>setFormData({...formData, submittedBy: e.target.value})} />
        <input className="w-full p-2 border rounded" type="date" value={formData.submittedOn || new Date().toISOString().split('T')[0]} onChange={e=>setFormData({...formData, submittedOn: e.target.value})} />
      </>
    );

    if (activeTab === 'carried') return (
      <>
        <input className="w-full mb-4 p-2 border rounded" placeholder="Song Title" value={formData.title || ''} onChange={e=>setFormData({...formData, title: e.target.value})} />
        <div className="flex gap-4 mb-4">
          <input className="flex-1 p-2 border rounded" placeholder="Key" value={formData.key || ''} onChange={e=>setFormData({...formData, key: e.target.value})} />
          <input className="flex-1 p-2 border rounded" placeholder="From Program" value={formData.originalProgram || ''} onChange={e=>setFormData({...formData, originalProgram: e.target.value})} />
          <input className="flex-1 p-2 border rounded" type="number" placeholder="Prior Rehearsals" value={formData.rehearsalCount || 1} onChange={e=>setFormData({...formData, rehearsalCount: parseInt(e.target.value) || 1})} />
        </div>
        <input className="w-full p-2 border rounded" placeholder="Reason for carry over" value={formData.reason || ''} onChange={e=>setFormData({...formData, reason: e.target.value})} />
      </>
    );

    if (activeTab === 'swapped') return (
      <>
        <div className="flex gap-4 mb-4">
          <input className="flex-1 p-2 border rounded" placeholder="Original Song" value={formData.original || ''} onChange={e=>setFormData({...formData, original: e.target.value})} />
          <input className="flex-1 p-2 border rounded" placeholder="Replacement Song" value={formData.replacement || ''} onChange={e=>setFormData({...formData, replacement: e.target.value})} />
        </div>
        <div className="flex gap-4 mb-4">
          <input className="flex-1 p-2 border rounded" placeholder="Swapped By" value={formData.swappedBy || ''} onChange={e=>setFormData({...formData, swappedBy: e.target.value})} />
          <input className="flex-1 p-2 border rounded" type="date" value={formData.swappedOn || new Date().toISOString().split('T')[0]} onChange={e=>setFormData({...formData, swappedOn: e.target.value})} />
        </div>
        <input className="w-full p-2 border rounded" placeholder="Reason" value={formData.reason || ''} onChange={e=>setFormData({...formData, reason: e.target.value})} />
      </>
    );

    if (activeTab === 'renamed') return (
      <>
        <div className="flex gap-4 mb-4">
          <input className="flex-1 p-2 border rounded" placeholder="Old Name" value={formData.from || ''} onChange={e=>setFormData({...formData, from: e.target.value})} />
          <input className="flex-1 p-2 border rounded" placeholder="New Name" value={formData.to || ''} onChange={e=>setFormData({...formData, to: e.target.value})} />
        </div>
        <div className="flex gap-4 mb-4">
          <input className="flex-1 p-2 border rounded" placeholder="Changed By" value={formData.changedBy || ''} onChange={e=>setFormData({...formData, changedBy: e.target.value})} />
          <input className="flex-1 p-2 border rounded" type="date" value={formData.changedOn || new Date().toISOString().split('T')[0]} onChange={e=>setFormData({...formData, changedOn: e.target.value})} />
        </div>
        <input className="w-full p-2 border rounded" placeholder="Reason" value={formData.reason || ''} onChange={e=>setFormData({...formData, reason: e.target.value})} />
      </>
    );

    if (activeTab === 'invalid') return (
      <>
        <input className="w-full mb-4 p-2 border rounded" placeholder="Song Title" value={formData.title || ''} onChange={e=>setFormData({...formData, title: e.target.value})} />
        <div className="flex gap-4 mb-4">
          <select className="flex-1 p-2 border rounded" value={formData.invalidatedBy || 'Swap'} onChange={e=>setFormData({...formData, invalidatedBy: e.target.value})}>
            <option value="Swap">Swap</option>
            <option value="Director">Director</option>
            <option value="Licensing">Licensing</option>
          </select>
          <input className="flex-1 p-2 border rounded" placeholder="Replaced By (Optional)" value={formData.replacedBy || ''} onChange={e=>setFormData({...formData, replacedBy: e.target.value})} />
        </div>
        <input className="w-full p-2 border rounded" type="date" value={formData.date || new Date().toISOString().split('T')[0]} onChange={e=>setFormData({...formData, date: e.target.value})} />
      </>
    );

    if (activeTab === 'eligibility') return (
      <>
        <div className="flex gap-4 mb-4">
          <input className="flex-[2] p-2 border rounded" placeholder="Name" value={formData.name || ''} onChange={e=>setFormData({...formData, name: e.target.value})} />
          <input className="flex-1 p-2 border rounded" placeholder="Role" value={formData.role || ''} onChange={e=>setFormData({...formData, role: e.target.value})} />
        </div>
        <div className="flex gap-4 mb-4">
          <input className="flex-1 p-2 border rounded" type="number" placeholder="Quota" value={formData.quota || 2} onChange={e=>setFormData({...formData, quota: parseInt(e.target.value) || 2})} />
          <input className="flex-1 p-2 border rounded" type="number" placeholder="Used" value={formData.submissions || 0} onChange={e=>setFormData({...formData, submissions: parseInt(e.target.value) || 0})} />
        </div>
        <div className="p-4 border rounded bg-slate-50 mb-4">
          <label className="flex items-center gap-2 font-bold mb-2">
            <input type="checkbox" checked={formData.isBlocked || false} onChange={e=>setFormData({...formData, isBlocked: e.target.checked})} />
            Mark as Ineligible
          </label>
          {formData.isBlocked && (
            <>
              <input className="w-full mb-2 p-2 border rounded" placeholder="Reason" value={formData.reason || ''} onChange={e=>setFormData({...formData, reason: e.target.value})} />
              <input className="w-full p-2 border rounded" type="date" value={formData.since || new Date().toISOString().split('T')[0]} onChange={e=>setFormData({...formData, since: e.target.value})} />
            </>
          )}
        </div>
      </>
    );

    return null;
  };

  const renderDataList = () => {
    if (!activeProgram) return null;
    const arrayName = getArrayNameForTab(activeTab);
    const data = (activeProgram as any)[arrayName] || [];

    if (data.length === 0) {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Clock className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No {TABS.find(t=>t.id === activeTab)?.label.toLowerCase()} yet</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Click the "Add Item" button above to start adding records to this section.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((item: any) => (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {item.time && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-md border border-slate-200">
                    {item.time}
                  </span>
                )}
                <h4 className="font-bold text-slate-800 text-lg">
                  {item.title || item.original || item.from || item.name}
                  {item.replacement && <span className="text-emerald-600 ml-2">→ {item.replacement}</span>}
                  {item.to && <span className="text-purple-600 ml-2">→ {item.to}</span>}
                </h4>
              </div>

              <div className="flex flex-wrap gap-2 mt-2 items-center">
                {item.status && (
                  <button 
                    onClick={() => {
                      if (canEdit && !viewHistory) {
                        const newStatus = item.status === 'rehearsed' ? 'not-rehearsed' : 'rehearsed';
                        const currentArray = (activeProgram as any)[arrayName] || [];
                        const updatedArray = currentArray.map((i: any) => i.id === item.id ? { ...i, status: newStatus } : i);
                        updateProgramData({ [arrayName]: updatedArray });
                      }
                    }}
                    disabled={!canEdit || viewHistory}
                    className={`px-2 py-0.5 text-xs font-bold rounded-full transition-transform active:scale-95 ${
                      item.status === 'rehearsed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                      item.status === 'break' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                      'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    } ${canEdit && !viewHistory ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {item.status === 'rehearsed' ? 'REHEARSED' : item.status === 'break' ? 'BREAK' : 'PENDING'}
                  </button>
                )}
                {item.key && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold text-xs rounded-full">
                    Key: {item.key}
                  </span>
                )}
                {item.allotment && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold text-xs rounded-full">
                    {item.allotment} mins
                  </span>
                )}
                {item.duration && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold text-xs rounded-full">
                    {item.duration}
                  </span>
                )}
                {item.isBlocked && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-xs rounded-full">
                    INELIGIBLE
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {item.submittedBy && <span><span className="font-medium text-slate-400">By:</span> {item.submittedBy}</span>}
                {item.swappedBy && <span><span className="font-medium text-slate-400">Swapped By:</span> {item.swappedBy}</span>}
                {item.changedBy && <span><span className="font-medium text-slate-400">Changed By:</span> {item.changedBy}</span>}
                {item.reason && <span><span className="font-medium text-slate-400">Reason:</span> {item.reason}</span>}
                {item.note && <span><span className="font-medium text-slate-400">Note:</span> {item.note}</span>}
                {item.role && <span><span className="font-medium text-slate-400">Role:</span> {item.role}</span>}
                {item.originalProgram && <span><span className="font-medium text-slate-400">From:</span> {item.originalProgram}</span>}
              </p>
            </div>
            {canEdit && !viewHistory && (
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => { setEditingItemId(item.id); setFormData(item); setShowAddModal(true); }} 
                  className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => handleDeleteItem(item.id, arrayName)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Schedule</h1>
          <p className="text-sm text-slate-500">Manage programs, daily schedules, and song submissions.</p>
        </div>
        <button 
          onClick={() => setViewHistory(!viewHistory)}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewHistory ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          {viewHistory ? <ArrowLeft className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
          {viewHistory ? 'Back to Active' : 'View Archive'}
        </button>
      </div>

      {/* PROGRAM PILLS */}
      <div className="px-6 py-4 flex items-center gap-3 overflow-x-auto border-b border-slate-200 bg-white shrink-0 scrollbar-hide">
        {programs.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveProgramId(p.id)}
            style={{ 
              backgroundColor: activeProgramId === p.id ? themeColor : '#f1f5f9',
              color: activeProgramId === p.id ? '#ffffff' : '#475569'
            }}
            className="px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-transform active:scale-95 shadow-sm"
          >
            {p.name}
          </button>
        ))}
        {canEdit && !viewHistory && (
          <button
            onClick={() => setShowCreateProg(true)}
            className="px-5 py-2.5 rounded-full border-2 border-dashed border-slate-300 text-slate-500 hover:border-purple-500 hover:text-purple-600 text-sm font-bold flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" /> Program
          </button>
        )}
      </div>

      {activeProgram ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TABS */}
          <div className="flex border-b border-slate-200 bg-white px-2 shrink-0 overflow-x-auto scrollbar-hide">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-4 text-sm font-bold border-b-[3px] transition-colors whitespace-nowrap ${activeTab === t.id ? 'border-purple-500 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                style={{ borderColor: activeTab === t.id ? themeColor : undefined, color: activeTab === t.id ? themeColor : undefined }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800">{TABS.find(t=>t.id === activeTab)?.label}</h2>
              {canEdit && (
                <div className="flex flex-wrap items-center gap-3">
                  {!viewHistory && (
                    <button onClick={() => { setFormData({}); setEditingItemId(null); setShowAddModal(true); }} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 shadow-md transition-transform active:scale-95">
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  )}
                  {!viewHistory && (
                    <button onClick={() => { setEditProgName(activeProgram.name); setShowEditProg(true); }} className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors shadow-sm bg-white border border-slate-200">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={toggleArchive} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-transform active:scale-95 shadow-sm ${viewHistory ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                    {viewHistory ? 'Restore to Active' : 'Archive Program'}
                  </button>
                  {viewHistory && (
                    <button onClick={() => { if(confirm('Are you sure you want to PERMANENTLY delete this program?')) deleteActiveProgram(); }} className="px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors shadow-sm bg-white border border-red-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {renderDataList()}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400">
          <Archive className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-medium text-lg text-slate-500">
            {viewHistory ? 'No archived programs found.' : 'No active programs.'}
          </p>
          {!viewHistory && canEdit && (
             <button
               onClick={() => setShowCreateProg(true)}
               className="mt-6 px-6 py-3 rounded-full text-white text-sm font-bold shadow-lg transition-transform active:scale-95"
               style={{ backgroundColor: themeColor }}
             >
               Create First Program
             </button>
          )}
        </div>
      )}

      {/* Create Program Modal */}
      {showCreateProg && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2">New Program</h3>
            <p className="text-sm text-slate-500 mb-6">Create a new scheduling board program.</p>
            
            <input 
              autoFocus
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:border-transparent outline-none mb-6 font-medium text-slate-800 transition-shadow"
              style={{ '--tw-ring-color': themeColor } as any}
              placeholder="e.g. Rhapsody Night 2026"
              value={newProgName}
              onChange={e => setNewProgName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newProgName.trim()) {
                  createProgram(newProgName.trim());
                  setNewProgName('');
                  setShowCreateProg(false);
                }
              }}
            />
            
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowCreateProg(false); setNewProgName(''); }} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
              <button 
                onClick={() => {
                  if (newProgName.trim()) {
                    createProgram(newProgName.trim());
                    setNewProgName('');
                    setShowCreateProg(false);
                  }
                }}
                disabled={!newProgName.trim()}
                className="px-6 py-2.5 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                style={{ backgroundColor: themeColor }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {showEditProg && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Rename Program</h3>
            <p className="text-sm text-slate-500 mb-6">Update the name of this program.</p>
            
            <input 
              autoFocus
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:border-transparent outline-none mb-6 font-medium text-slate-800 transition-shadow"
              style={{ '--tw-ring-color': themeColor } as any}
              placeholder="e.g. Rhapsody Night 2026"
              value={editProgName}
              onChange={e => setEditProgName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && editProgName.trim()) {
                  renameActiveProgram(editProgName.trim());
                  setShowEditProg(false);
                }
              }}
            />
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEditProg(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
              <button 
                onClick={() => {
                  if (editProgName.trim()) {
                    renameActiveProgram(editProgName.trim());
                    setShowEditProg(false);
                  }
                }}
                disabled={!editProgName.trim() || editProgName.trim() === activeProgram?.name}
                className="px-6 py-2.5 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                style={{ backgroundColor: themeColor }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{editingItemId ? 'Edit' : 'Add'} {TABS.find(t=>t.id === activeTab)?.label}</h3>
            
            {renderAddForm()}

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => { setShowAddModal(false); setEditingItemId(null); }} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancel</button>
              <button 
                onClick={handleSaveItem}
                className="px-6 py-2.5 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
                style={{ backgroundColor: themeColor }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
