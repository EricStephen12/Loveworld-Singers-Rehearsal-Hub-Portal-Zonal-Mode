"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Save, Crosshair, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-setup';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';

import { useZone } from '@/hooks/useZone';
import { isHQGroup } from '@/config/zones';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

export default function GeofenceConfigSection() {
  const { currentZone } = useZone();
  const [lat, setLat] = useState('6.458985');
  const [lon, setLon] = useState('3.406232');
  const [radius, setRadius] = useState('200');
  const [activeEventName, setActiveEventName] = useState('Rehearsal');
  const [saving, setSaving] = useState(false);

  // You will need to add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file!
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  // HQ zones all rehearse at the same location → share one geofence doc
  // Outside/regional zones each get their own separate geofence
  const docId = currentZone?.id
    ? isHQGroup(currentZone.id) ? 'geofence_hq' : `geofence_${currentZone.id}`
    : 'geofence';

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', docId));
        if (snap.exists()) {
          const data = snap.data();
          if (data.latitude) setLat(data.latitude.toString());
          if (data.longitude) setLon(data.longitude.toString());
          if (data.radius) setRadius(data.radius.toString());
          if (data.activeEventName) setActiveEventName(data.activeEventName);
        } else {
          // Reset to defaults if no custom geofence is set for this zone
          setLat('6.458985');
          setLon('3.406232');
          setRadius('200');
          setActiveEventName('Rehearsal');
        }
      } catch (err) {
        console.error("Failed to load geofence", err);
      }
    };
    loadSettings();
  }, [docId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', docId), {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        radius: parseInt(radius, 10),
        activeEventName: activeEventName.trim() || 'Rehearsal',
        updatedAt: serverTimestamp(),
        zoneId: currentZone?.id || 'default'
      }, { merge: true });
      alert('Geofence settings updated successfully!');
    } catch (error) {
      console.error("Failed to save geofence", error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setLat(e.latLng.lat().toFixed(6));
      setLon(e.latLng.lng().toFixed(6));
    }
  }, []);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toFixed(6));
          setLon(position.coords.longitude.toFixed(6));
        },
        (error) => {
          alert('Could not get your current location. Please ensure location services are enabled.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const position = {
    lat: parseFloat(lat) || 6.458985,
    lng: parseFloat(lon) || 3.406232
  };
  const radiusNum = parseInt(radius, 10) || 200;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="text-purple-600" />
            Geofenced Clock-in Map
          </h1>
          <p className="text-slate-500 mt-2">
            Click anywhere on the map to set the clock-in location, or type the coordinates manually.
          </p>
        </div>
        <button
          onClick={handleGetCurrentLocation}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          <Crosshair size={16} />
          Use My Current Location
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Map Section */}
        <div className="flex-1 rounded-xl overflow-hidden shadow-sm border border-slate-200 relative z-10" style={{ minHeight: '400px' }}>
          {loadError ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-500 p-6 text-center">
              <MapPin size={48} className="mb-4 opacity-50" />
              <p className="font-semibold">Failed to load Google Maps.</p>
              <p className="text-sm mt-2 opacity-80">Make sure your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is correct and active.</p>
            </div>
          ) : !isLoaded ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={position}
              zoom={16}
              onClick={handleMapClick}
              options={{
                disableDefaultUI: false,
                clickableIcons: false,
              }}
            >
              <Marker position={position} />
              <Circle
                center={position}
                radius={radiusNum}
                options={{
                  fillColor: '#9333ea',
                  fillOpacity: 0.2,
                  strokeColor: '#9333ea',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
              />
            </GoogleMap>
          )}
        </div>

        {/* Controls Section */}
        <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col shrink-0">
          <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-3">Coordinates</h3>
          
          <div className="space-y-5 flex-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latitude</label>
              <input
                type="number" step="any" value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none font-mono text-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Longitude</label>
              <input
                type="number" step="any" value={lon}
                onChange={(e) => setLon(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Radius (Meters)</label>
              <input
                type="number" value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5 mt-4 pt-4 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Event Title</label>
              <p className="text-[10px] text-slate-400 mb-1 leading-tight">Geofence clock-ins will be logged under this event.</p>
              <input
                type="text" value={activeEventName}
                onChange={(e) => setActiveEventName(e.target.value)}
                placeholder="e.g. Rehearsal"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none text-sm font-medium"
              />
            </div>
          </div>

          <button
            onClick={handleSave} disabled={saving}
            className="mt-8 flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Geofence'}
          </button>
        </div>
      </div>
    </div>
  );
}
