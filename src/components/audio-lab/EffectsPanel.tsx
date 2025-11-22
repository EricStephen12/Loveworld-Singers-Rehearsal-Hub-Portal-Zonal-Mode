'use client';

import { useState } from 'react';
import { useAudioStore } from '@/lib/audio-store';
import { Sliders, Volume2, Zap, Music, Settings, X, Plus } from 'lucide-react';

export default function EffectsPanel() {
  const { tracks, addEffect, removeEffect } = useAudioStore();
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [showAddEffect, setShowAddEffect] = useState(false);

  const effectTypes = [
    { id: 'reverb', name: 'Reverb', icon: '🌊', description: 'Add space and depth' },
    { id: 'eq', name: 'EQ', icon: '📊', description: 'Shape frequency response' },
    { id: 'compression', name: 'Compressor', icon: '🎚️', description: 'Control dynamics' },
    { id: 'delay', name: 'Delay', icon: '🔄', description: 'Add echo effects' },
    { id: 'distortion', name: 'Distortion', icon: '⚡', description: 'Add grit and warmth' },
  ];

  const addNewEffect = (effectType: string) => {
    if (!selectedTrack) return;

    const defaultParams = {
      reverb: { wet: 0.3, decay: 2.0 },
      eq: { low: 0, mid: 0, high: 0 },
      compression: { threshold: -18, ratio: 4, attack: 0.003, release: 0.1 },
      delay: { delayTime: 0.25, feedback: 0.3, wet: 0.2 },
      distortion: { distortion: 0.4, wet: 0.5 },
    };

    const effect = {
      id: Date.now().toString(),
      type: effectType as any,
      params: defaultParams[effectType as keyof typeof defaultParams] || {},
      enabled: true,
    };

    addEffect(selectedTrack, effect);
    setShowAddEffect(false);
  };

  const updateEffectParam = (trackId: string, effectId: string, param: string, value: number) => {
    // This would update the effect parameters in real-time
    console.log('Updating effect param:', { trackId, effectId, param, value });
  };

  const toggleEffect = (trackId: string, effectId: string) => {
    // This would toggle the effect on/off
    console.log('Toggling effect:', { trackId, effectId });
  };

  const selectedTrackData = tracks.find(t => t.id === selectedTrack);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Effects</h3>
        </div>
        {selectedTrackData && (
          <button
            onClick={() => setShowAddEffect(true)}
            className="bg-purple-600 text-white p-1 rounded hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Track Selection */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Select Track</label>
        <select
          value={selectedTrack}
          onChange={(e) => setSelectedTrack(e.target.value)}
          className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Choose a track...</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>
      </div>

      {/* Effects List */}
      {selectedTrackData ? (
        <div className="space-y-3">
          {selectedTrackData.effects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No effects applied</p>
              <p className="text-xs">Click + to add effects</p>
            </div>
          ) : (
            selectedTrackData.effects.map((effect) => (
              <div key={effect.id} className="bg-gray-700/50 rounded-lg p-3">
                {/* Effect Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {effectTypes.find(t => t.id === effect.type)?.icon || '🎛️'}
                    </span>
                    <span className="font-medium text-white capitalize">
                      {effect.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleEffect(selectedTrack, effect.id)}
                      className={`w-8 h-4 rounded-full transition-colors ${
                        effect.enabled ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 bg-white rounded-full transition-transform ${
                          effect.enabled ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => removeEffect(selectedTrack, effect.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Effect Parameters */}
                <div className="space-y-2">
                  {Object.entries(effect.params).map(([param, value]) => (
                    <div key={param} className="flex items-center space-x-3">
                      <label className="text-xs text-gray-400 w-16 capitalize">
                        {param}
                      </label>
                      <input
                        type="range"
                        min={getParamRange(effect.type, param).min}
                        max={getParamRange(effect.type, param).max}
                        step={getParamRange(effect.type, param).step}
                        value={value as number}
                        onChange={(e) =>
                          updateEffectParam(
                            selectedTrack,
                            effect.id,
                            param,
                            parseFloat(e.target.value)
                          )
                        }
                        className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span className="text-xs text-gray-400 w-12 text-right">
                        {typeof value === 'number' ? value.toFixed(2) : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a track to view effects</p>
        </div>
      )}

      {/* Add Effect Modal */}
      {showAddEffect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white">Add Effect</h4>
              <button
                onClick={() => setShowAddEffect(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {effectTypes.map((effectType) => (
                <button
                  key={effectType.id}
                  onClick={() => addNewEffect(effectType.id)}
                  className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-left"
                >
                  <span className="text-2xl">{effectType.icon}</span>
                  <div>
                    <div className="font-medium text-white">{effectType.name}</div>
                    <div className="text-sm text-gray-400">{effectType.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}

function getParamRange(effectType: string, param: string) {
  const ranges: Record<string, Record<string, { min: number; max: number; step: number }>> = {
    reverb: {
      wet: { min: 0, max: 1, step: 0.01 },
      decay: { min: 0.1, max: 10, step: 0.1 },
    },
    eq: {
      low: { min: -20, max: 20, step: 0.5 },
      mid: { min: -20, max: 20, step: 0.5 },
      high: { min: -20, max: 20, step: 0.5 },
    },
    compression: {
      threshold: { min: -40, max: 0, step: 1 },
      ratio: { min: 1, max: 20, step: 0.5 },
      attack: { min: 0.001, max: 1, step: 0.001 },
      release: { min: 0.01, max: 3, step: 0.01 },
    },
    delay: {
      delayTime: { min: 0.01, max: 1, step: 0.01 },
      feedback: { min: 0, max: 0.95, step: 0.01 },
      wet: { min: 0, max: 1, step: 0.01 },
    },
    distortion: {
      distortion: { min: 0, max: 1, step: 0.01 },
      wet: { min: 0, max: 1, step: 0.01 },
    },
  };

  return ranges[effectType]?.[param] || { min: 0, max: 1, step: 0.01 };
}