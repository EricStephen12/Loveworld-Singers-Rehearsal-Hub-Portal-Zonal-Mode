'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
    Bold, Italic, AlignLeft, AlignCenter, AlignRight,
    Plus, Trash2, ChevronLeft, ChevronRight, Save,
    RotateCcw
} from 'lucide-react'
import { GridCell, SpreadsheetData } from '@/lib/schedule-service'

interface SpreadsheetEditorProps {
    initialData?: SpreadsheetData
    onChange: (data: SpreadsheetData) => void
    onSave?: (data: SpreadsheetData) => void
    isSaving?: boolean
    themeColor?: string
}

const DEFAULT_COLUMNS = [
    { width: 80, label: 'Time' },
    { width: 250, label: 'Activity / Song' },
    { width: 150, label: 'Leader' },
    { width: 100, label: 'Duration' }
]

const DEFAULT_DATA: SpreadsheetData = {
    columns: DEFAULT_COLUMNS,
    rows: Array.from({ length: 15 }, () => ({ height: 40 })),
    data: {}
}

export default function SpreadsheetEditor({
    initialData,
    onChange,
    onSave,
    isSaving,
    themeColor = '#9333ea'
}: SpreadsheetEditorProps) {
    const [spreadsheet, setSpreadsheet] = useState<SpreadsheetData>(initialData || DEFAULT_DATA)
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
    const [editingHeader, setEditingHeader] = useState<{ type: 'col' | 'row'; index: number } | null>(null)
    const [history, setHistory] = useState<SpreadsheetData[]>([])

    // Sync if initialData changes (e.g. switching dates)
    useEffect(() => {
        if (initialData) {
            setSpreadsheet(initialData)
        } else {
            setSpreadsheet(DEFAULT_DATA)
        }
    }, [initialData])

    const handleCellChange = (row: number, col: number, value: string) => {
        const newData = { ...spreadsheet.data }
        const key = `${row}:${col}`

        if (!value) {
            delete newData[key]
        } else {
            newData[key] = { ...newData[key], value }
        }

        const updated = { ...spreadsheet, data: newData }
        setSpreadsheet(updated)
        onChange(updated)
    }

    const toggleStyle = (style: 'bold' | 'italic') => {
        if (!selectedCell) return
        const key = `${selectedCell.row}:${selectedCell.col}`
        const newData = { ...spreadsheet.data }
        const cell = newData[key] || { value: '' }

        newData[key] = { ...cell, [style]: !cell[style] }

        const updated = { ...spreadsheet, data: newData }
        setSpreadsheet(updated)
        onChange(updated)
    }

    const setAlignment = (align: 'left' | 'center' | 'right') => {
        if (!selectedCell) return
        const key = `${selectedCell.row}:${selectedCell.col}`
        const newData = { ...spreadsheet.data }
        const cell = newData[key] || { value: '' }

        newData[key] = { ...cell, align }

        const updated = { ...spreadsheet, data: newData }
        setSpreadsheet(updated)
        onChange(updated)
    }

    const addRow = () => {
        const updated = {
            ...spreadsheet,
            rows: [...spreadsheet.rows, { height: 40 }]
        }
        setSpreadsheet(updated)
        onChange(updated)
    }

    const deleteRow = (index: number) => {
        if (spreadsheet.rows.length <= 1) return
        const updatedRows = spreadsheet.rows.filter((_, i) => i !== index)
        const newData: Record<string, GridCell> = {}

        // Re-map keys
        Object.entries(spreadsheet.data).forEach(([key, cell]) => {
            const [r, c] = key.split(':').map(Number)
            if (r < index) newData[key] = cell
            if (r > index) newData[`${r - 1}:${c}`] = cell
        })

        const updated = { ...spreadsheet, rows: updatedRows, data: newData }
        setSpreadsheet(updated)
        onChange(updated)
    }

    const addColumn = () => {
        const updated = {
            ...spreadsheet,
            columns: [...spreadsheet.columns, { width: 150, label: 'New Col' }]
        }
        setSpreadsheet(updated)
        onChange(updated)
    }

    const deleteColumn = (index: number) => {
        if (spreadsheet.columns.length <= 1) return
        const updatedCols = spreadsheet.columns.filter((_, i) => i !== index)
        const newData: Record<string, GridCell> = {}

        Object.entries(spreadsheet.data).forEach(([key, cell]) => {
            const [r, c] = key.split(':').map(Number)
            if (c < index) newData[key] = cell
            if (c > index) newData[`${r}:${c - 1}`] = cell
        })

        const updated = { ...spreadsheet, columns: updatedCols, data: newData }
        setSpreadsheet(updated)
        onChange(updated)
    }

    const getColumnName = (index: number) => {
        return String.fromCharCode(65 + index)
    }

    const updateHeaderLabel = (type: 'col' | 'row', index: number, label: string) => {
        const updated = { ...spreadsheet }
        if (type === 'col') {
            updated.columns = [...updated.columns]
            updated.columns[index] = { ...updated.columns[index], label }
        } else {
            updated.rows = [...updated.rows]
            updated.rows[index] = { ...updated.rows[index], label }
        }
        setSpreadsheet(updated)
        onChange(updated)
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="p-2 bg-white border-b border-slate-200 flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg">
                    <button
                        onClick={() => toggleStyle('bold')}
                        className={`p-1.5 rounded-md transition-colors ${selectedCell && spreadsheet.data[`${selectedCell.row}:${selectedCell.col}`]?.bold ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => toggleStyle('italic')}
                        className={`p-1.5 rounded-md transition-colors ${selectedCell && spreadsheet.data[`${selectedCell.row}:${selectedCell.col}`]?.italic ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                </div>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg">
                    <button
                        onClick={() => setAlignment('left')}
                        className={`p-1.5 rounded-md transition-colors ${selectedCell && (spreadsheet.data[`${selectedCell.row}:${selectedCell.col}`]?.align === 'left' || !spreadsheet.data[`${selectedCell.row}:${selectedCell.col}`]?.align) ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setAlignment('center')}
                        className={`p-1.5 rounded-md transition-colors ${selectedCell && spreadsheet.data[`${selectedCell.row}:${selectedCell.col}`]?.align === 'center' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setAlignment('right')}
                        className={`p-1.5 rounded-md transition-colors ${selectedCell && spreadsheet.data[`${selectedCell.row}:${selectedCell.col}`]?.align === 'right' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <AlignRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                <button
                    onClick={addColumn}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" /> Col
                </button>
                <button
                    onClick={addRow}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" /> Row
                </button>

                <div className="flex-1" />

                {onSave && (
                    <button
                        onClick={() => onSave(spreadsheet)}
                        disabled={isSaving}
                        className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                        style={{ backgroundColor: themeColor }}
                    >
                        {isSaving ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                    </button>
                )}
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-auto relative">
                <table className="border-collapse table-fixed bg-white min-w-full">
                    <thead>
                        <tr>
                            <th className="w-10 bg-slate-100 border border-slate-200 sticky top-0 left-0 z-20"></th>
                            {spreadsheet.columns.map((col, cIdx) => (
                                <th
                                    key={cIdx}
                                    style={{ width: col.width }}
                                    className={`bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest py-1.5 sticky top-0 z-10 group relative cursor-pointer hover:bg-slate-200 transition-colors ${editingHeader?.type === 'col' && editingHeader.index === cIdx ? 'ring-2 ring-indigo-500 z-30' : ''}`}
                                    onClick={() => setEditingHeader({ type: 'col', index: cIdx })}
                                >
                                    {editingHeader?.type === 'col' && editingHeader.index === cIdx ? (
                                        <input
                                            autoFocus
                                            className="w-full bg-white px-2 py-1 text-xs font-bold text-slate-900 normal-case outline-none ring-1 ring-indigo-300 rounded"
                                            value={col.label || ''}
                                            onChange={(e) => updateHeaderLabel('col', cIdx, e.target.value)}
                                            onBlur={() => setEditingHeader(null)}
                                            onKeyDown={(e) => e.key === 'Enter' && setEditingHeader(null)}
                                            placeholder={`Col ${getColumnName(cIdx)}`}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-0.5">
                                            <span className="opacity-60">{getColumnName(cIdx)}</span>
                                            {col.label && <span className="normal-case font-bold text-slate-700 text-[9px] truncate max-w-full px-1">{col.label}</span>}
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteColumn(cIdx); }}
                                        className="absolute right-0.5 top-0.5 p-1 rounded-md bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {spreadsheet.rows.map((row, rIdx) => (
                            <tr key={rIdx} style={{ height: row.height }}>
                                <td
                                    className={`bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-400 text-center sticky left-0 z-10 group relative cursor-pointer hover:bg-slate-100 transition-colors ${editingHeader?.type === 'row' && editingHeader.index === rIdx ? 'ring-2 ring-indigo-500 z-30' : ''}`}
                                    onClick={() => setEditingHeader({ type: 'row', index: rIdx })}
                                >
                                    {editingHeader?.type === 'row' && editingHeader.index === rIdx ? (
                                        <input
                                            autoFocus
                                            className="w-16 bg-white px-1 py-0.5 text-center text-xs font-bold text-slate-900 normal-case outline-none ring-1 ring-indigo-300 rounded shadow-lg absolute left-10 top-0 z-40"
                                            value={row.label || ''}
                                            onChange={(e) => updateHeaderLabel('row', rIdx, e.target.value)}
                                            onBlur={() => setEditingHeader(null)}
                                            onKeyDown={(e) => e.key === 'Enter' && setEditingHeader(null)}
                                            placeholder={`Row ${rIdx + 1}`}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <span className="opacity-60">{rIdx + 1}</span>
                                            {row.label && <span className="normal-case font-bold text-indigo-600 text-[8px] truncate max-w-[36px] mt-0.5">{row.label}</span>}
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteRow(rIdx); }}
                                        className="absolute left-0 bottom-0 p-1 rounded-md bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                    >
                                        <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                </td>
                                {spreadsheet.columns.map((_, cIdx) => {
                                    const key = `${rIdx}:${cIdx}`
                                    const cell = spreadsheet.data[key] || { value: '' }
                                    const isSelected = selectedCell?.row === rIdx && selectedCell?.col === cIdx

                                    return (
                                        <td
                                            key={cIdx}
                                            className={`border border-slate-200 p-0 transition-all ${isSelected ? 'ring-2 ring-indigo-500 ring-inset z-10 shadow-lg shadow-indigo-100' : 'hover:bg-slate-50/50'}`}
                                            onClick={() => setSelectedCell({ row: rIdx, col: cIdx })}
                                        >
                                            <input
                                                value={cell.value}
                                                onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                                className={`w-full h-full px-2 py-1 text-sm bg-transparent outline-none border-none
                                                    ${cell.bold ? 'font-bold' : ''}
                                                    ${cell.italic ? 'italic' : ''}
                                                    ${cell.align === 'center' ? 'text-center' : cell.align === 'right' ? 'text-right' : 'text-left'}
                                                `}
                                                placeholder=""
                                            />
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer / Info */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div>{spreadsheet.rows.length} Rows × {spreadsheet.columns.length} Columns</div>
                {selectedCell && (
                    <div className="text-indigo-600">Cell {getColumnName(selectedCell.col)}{selectedCell.row + 1}</div>
                )}
            </div>
        </div>
    )
}
