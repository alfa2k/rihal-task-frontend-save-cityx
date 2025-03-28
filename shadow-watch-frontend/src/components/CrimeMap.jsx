import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import useCrimeStore from '../store/crimestore';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function CrimeMap({ isDark, sidebarCollapsed, isMobile }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  
  // Initialize map style based on mode
  const [mapStyle, setMapStyle] = useState(
    isDark ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/light-v10'
  );

  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };

    // Trigger resize after a short delay to ensure layout has updated
    const resizeTimer = setTimeout(handleResize, 300);

    return () => {
      clearTimeout(resizeTimer);
    };
  }, [sidebarCollapsed]);

  // Destructure needed props from the store.
  const { filteredCrimes, setSelectedCrime, reportForm, toggleLocationSelectionMode, setTempLocation } = useCrimeStore();

  // Utility: Format the date (expects "YYYY-MM-DD-HH-mm")
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const [year, month, day, hour, minute] = dateString.split('-');
      return `${day}/${month}/${year} ${hour}:${minute}`;
    } catch (e) {
      return dateString;
    }
  };

  // Create a marker element for a crime.
  const createMarkerElement = (crime) => {
    const colorMap = {
      'Assault': '#ffaa00',
      'Robbery': '#d00000',
      'Homicide': '#dc2f02',
      'Kidnapping': '#00b4d8',
      'Theft': '#f72585',
      'default': '#5e60ce'
    };
    const statusColorMap = {
      'Pending': '#faa307',
      'Resolved': '#38b000',
      'En Route': '#3a86ff',
      'On Scene': '#6a00f4',
      'Under Investigation': '#6930c3',
      'default': '#5e60ce'
    };
    const color = colorMap[crime.crime_type] || colorMap.default;
    const statusColor = statusColorMap[crime.report_status] || statusColorMap.default;
    const opacity = crime.report_status === 'Resolved' ? '0.7' : '1';

    const el = document.createElement('div');
    el.className = `crime-marker marker-${crime.crime_type.toLowerCase()}`;
    el.style.width = '28px';
    el.style.height = '28px';
    el.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background-color: ${color};
        opacity: ${opacity};
        border-radius: 50%;
        box-shadow: 0 0 0 2px #fff;
        position: relative;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <div style="
          position: absolute;
          top: -6px;
          right: -6px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: ${statusColor};
          border: 2px solid white;
        "></div>
      </div>
    `;
    return el;
  };

  // Create popup content with a "Details" button.
  const createPopupContent = (crime) => {
    const dateStr = formatDate(crime.report_date_time);
    return `
      <div style="padding: 8px; ${isDark ? 'background-color: #1A1B25; color: #f8f9fa;' : 'background-color: #ffffff; color: #333;'}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-weight: 700;">${crime.crime_type}</span>
          <span style="background-color: ${
            crime.report_status === 'Pending' ? '#faa307' :
            crime.report_status === 'Resolved' ? '#38b000' :
            crime.report_status === 'En Route' ? '#3a86ff' :
            crime.report_status === 'On Scene' ? '#6a00f4' :
            crime.report_status === 'Under Investigation' ? '#6930c3' : '#5e60ce'
          }; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${crime.report_status}</span>
        </div>
        <div style="font-size: 10px; margin-bottom: 4px;">${dateStr}</div>
        <div style="max-height: 80px; overflow-y: auto; font-size: 10px;">${crime.report_details}</div>
        <div style="margin-top: 8px; text-align: right;">
          <button style="font-size: 10px; padding: 4px 8px; background-color: ${isDark ? '#2C2E33' : '#e9ecef'}; color: ${isDark ? '#fff' : '#333'}; border: none; border-radius: 4px; cursor: pointer;"
            onclick="window.zoomToCrime(${crime.id})">
            Details
          </button>
        </div>
      </div>
    `;
  };

  // Global zoom function: called when user clicks the Details button.
  useEffect(() => {
    window.zoomToCrime = (id) => {
      const crime = filteredCrimes.find(c => c.id === id);
      if (crime && crime.report_details && crime.report_details.trim().length > 0) {
        // Fly to the crime location with desired zoom, pitch, and bearing.
        mapRef.current.flyTo({
          center: [Number(crime.longitude), Number(crime.latitude)],
          zoom: 16,
          pitch: 60,
          bearing: 20,
          duration: 9000,
          essential: true
        });
      }
    };
    return () => { delete window.zoomToCrime; };
  }, [filteredCrimes]);

  // When dark mode toggles, update the map style.
  useEffect(() => {
    if (mapStyle === 'mapbox://styles/mapbox/light-v10' || mapStyle === 'mapbox://styles/mapbox/dark-v10') {
      const newStyle = isDark ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/light-v10';
      setMapStyle(newStyle);
      if (mapRef.current) {
        mapRef.current.setStyle(newStyle);
      }
    }
  }, [isDark, mapStyle]);

  // Initialize the map (only once or when location selection toggles).
  useEffect(() => {
    if (!mapContainerRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [58.3829, 23.5880],
      zoom: 6,
      attributionControl: false,
      logoPosition: 'bottom-left',
      interactive: true,
      trackResize: true
    });
    // Add navigation control (zoom in/out) at top-right.
    const nav = new mapboxgl.NavigationControl({ showCompass: false });
    mapRef.current.addControl(nav, 'top-right');

    // Handle map clicks for location selection.
    mapRef.current.on('click', (e) => {
      if (reportForm.locationSelectionMode) {
        const { lng, lat } = e.lngLat;
        setTempLocation({ latitude: lat, longitude: lng });
      }
    });

    // Expose a simple handler (if needed).
    window.handleCrimeDetails = (id) => { setSelectedCrime(id); };

    const handleResize = () => {
      if (mapRef.current) mapRef.current.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (mapRef.current) mapRef.current.remove();
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      window.removeEventListener('resize', handleResize);
      delete window.handleCrimeDetails;
    };
  }, [mapStyle, reportForm.locationSelectionMode, setTempLocation]);

  // Update markers when filteredCrimes change (without reloading the whole map).
  useEffect(() => {
    if (!mapRef.current) return;
    // Remove existing markers.
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    filteredCrimes.forEach(crime => {
      const lat = Number(crime.latitude);
      const lng = Number(crime.longitude);
      // Only add markers within Oman bounds.
      if (isNaN(lat) || isNaN(lng) || lat < 16 || lat > 27 || lng < 52 || lng > 60) return;
      const el = createMarkerElement(crime);
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(createPopupContent(crime))
        )
        .addTo(mapRef.current);
      // On marker click, set the selected crime.
      el.addEventListener('click', () => setSelectedCrime(crime.id));
      markersRef.current.push(marker);
    });
  }, [filteredCrimes, isDark, mapStyle, setSelectedCrime]);

  // Temporary marker for location selection.
  useEffect(() => {
    let tempMarker;
    if (reportForm.tempLocation && reportForm.locationSelectionMode) {
      const { latitude, longitude } = reportForm.tempLocation;
      const tempEl = document.createElement('div');
      tempEl.className = 'temp-marker';
      tempEl.style.width = '30px';
      tempEl.style.height = '30px';
      tempEl.innerHTML = `<div style="background-color: #6930c3; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(105,48,195,0.5);"></div>`;
      tempMarker = new mapboxgl.Marker(tempEl)
        .setLngLat([Number(reportForm.tempLocation.longitude), Number(reportForm.tempLocation.latitude)])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <div style="font-size: 12px; font-weight:600; margin-bottom:4px;">Selected Location</div>
              <div style="font-size: 10px;">Latitude: ${Number(reportForm.tempLocation.latitude).toFixed(6)}</div>
              <div style="font-size: 10px;">Longitude: ${Number(reportForm.tempLocation.longitude).toFixed(6)}</div>
              <button style="margin-top: 8px; font-size: 10px; padding: 4px 8px; background-color: #6930c3; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="window.handleConfirmLocation()">
                Confirm Location
              </button>
            </div>
          `)
        )
        .addTo(mapRef.current);
      // When the user confirms location, disable location selection and re-open the report form.
      window.handleConfirmLocation = () => {
        toggleLocationSelectionMode();
        // You may want to trigger a re-open of the report form via your store.
      };
    }
    return () => {
      if (tempMarker) {
        tempMarker.remove();
        delete window.handleConfirmLocation;
      }
    };
  }, [reportForm.tempLocation, reportForm.locationSelectionMode, toggleLocationSelectionMode]);

  // Handle map style change from the style selector.
  const handleStyleChange = (e) => {
    const newStyle = e.target.value;
    setMapStyle(newStyle);
    if (mapRef.current) {
      mapRef.current.setStyle(newStyle);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' ,overflow: 'hidden'}}>
      <div
        ref={mapContainerRef}
        style={{ height: '100%', width: '100%', borderRadius: 0, position: 'absolute',
          top: 0,
          left: 0 }}
        className="map-container"
      />
      {/* Bottom-right overlay for legends and style selector */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingBottom: '8px'
        }}>
        {/* Legend for Crime Type */}
        <div style={{
          background: isDark ? 'rgba(26,27,37,0.9)' : 'rgba(255,255,255,0.9)',
          padding: '8px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          fontSize: '10px',
          color: isDark ? '#ffffff' : '#000000'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Crime Type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['Assault', 'Robbery', 'Homicide', 'Kidnapping', 'Theft'].map(type => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: {
                    'Assault': '#ffaa00',
                    'Robbery': '#d00000',
                    'Homicide': '#dc2f02',
                    'Kidnapping': '#00b4d8',
                    'Theft': '#f72585'
                  }[type]
                }}></div>
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Legend for Status */}
        <div style={{
          background: isDark ? 'rgba(26,27,37,0.9)' : 'rgba(255,255,255,0.9)',
          padding: '8px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          fontSize: '10px',
          color: isDark ? '#ffffff' : '#000000'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Status</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['Pending', 'En Route', 'On Scene', 'Under Investigation', 'Resolved'].map(status => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: {
                    'Pending': '#faa307',
                    'En Route': '#3a86ff',
                    'On Scene': '#6a00f4',
                    'Under Investigation': '#6930c3',
                    'Resolved': '#38b000'
                  }[status]
                }}></div>
                <span>{status}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Map Style Selector */}
        <div style={{
          background: isDark ? 'rgba(26,27,37,0.9)' : 'rgba(255,255,255,0.9)',
          padding: '4px 8px',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          fontSize: '10px',
          color: isDark ? '#ffffff' : '#000000'
        }}>
          <label style={{ marginRight: '4px' }}>Map Style:</label>
          <select style={{ fontSize: '10px' }} value={mapStyle} onChange={handleStyleChange}>
            {isDark ? (
              <>
                <option value="mapbox://styles/mapbox/dark-v10">Dark</option>
                <option value="mapbox://styles/mapbox/standard">Streets</option>
                <option value="mapbox://styles/mapbox/standard-satellite">Satellite</option>
              </>
            ) : (
              <>
                <option value="mapbox://styles/mapbox/light-v10">Light</option>
                <option value="mapbox://styles/mapbox/standard">Streets</option>
                <option value="mapbox://styles/mapbox/standard-satellite">Satellite</option>
              </>
            )}
          </select>
        </div>
      </div>
    )}
      <style>{`
        .mapboxgl-popup { max-width: 300px; }
        .mapboxgl-popup-content { padding: 0; border-radius: 8px; }
        .pulse-animation { animation: pulse 2s infinite; }
        @keyframes pulse { 
          0% { transform: scale(1); opacity: 1; } 
          50% { transform: scale(1.1); opacity: 0.8; } 
          100% { transform: scale(1); opacity: 1; } 
        }
      `}</style>
    </div>
  );
}

export default CrimeMap;
