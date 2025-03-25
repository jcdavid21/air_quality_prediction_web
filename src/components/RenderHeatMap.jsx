
import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';


const RenderHeatmap = ({filteredData, heatmapData, selectedCity, selectedMonth}) => {
    if (!filteredData || filteredData.length === 0) {
      return (
        <div className="p-4">
          <h3 className="text-md font-medium text-gray-700 mb-4">
            No heatmap data available for {selectedCity}
          </h3>
        </div>
      );
    }
  
    // Process heatmap data from backend
    const locations = heatmapData
      .filter(item => item.lat && item.lon)
      .map(item => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        aqi: item.avg_aqi,
        city: item.city_name,
        dataPoints: item.data_points
      }));
  
    if (locations.length === 0) {
      return (
        <div className="p-4">
          <h3 className="text-md font-medium text-gray-700 mb-4">
            No valid location data available
          </h3>
        </div>
      );
    }
  
    // Calculate center point
    const center = locations.reduce((acc, loc) => {
      acc.lat += loc.lat;
      acc.lng += loc.lng;
      return acc;
    }, { lat: 0, lng: 0 });
  
    center.lat /= locations.length;
    center.lng /= locations.length;

    // Unified color function that matches health risk exactly
    const getColor = (aqi) => {
      if (aqi <= 1) return '#a8e05f';       // Good - green
      if (aqi <= 2) return '#fdd64b';       // Moderate - yellow
      if (aqi <= 3) return '#ff9b57';       // Unhealthy for Sensitive - orange
      if (aqi <= 4) return '#fe6a69';       // Unhealthy - red
      return '#a97abc';                     // Very Unhealthy - purple
    };

    // Get radius based on data points
    const getRadius = (dataPoints) => {
      return 8 + (Math.log(dataPoints) * 2); // Logarithmic scaling
    };

    // Get label for AQI value
    const getLabel = (aqi) => {
      if (aqi <= 1) return 'Good';
      if (aqi <= 2) return 'Moderate';
      if (aqi <= 3) return 'Unhealthy for Sensitive Groups';
      if (aqi <= 4) return 'Unhealthy';
      return 'Very Unhealthy';
    };
  
    return (
      <div className="p-4">
        <h3 className="text-md font-medium text-gray-700 mb-4">
          Air Quality Map for {selectedCity} - {selectedMonth}
        </h3>
        
        <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
          <MapContainer 
            center={[center.lat, center.lng]} 
            zoom={selectedCity === 'All Cities' ? 6 : 10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {locations.map((location, index) => {
              const color = getColor(location.aqi);
              const label = getLabel(location.aqi);
              
              return (
                <CircleMarker
                  key={`${location.lat}-${location.lng}-${index}`}
                  center={[location.lat, location.lng]}
                  radius={getRadius(location.dataPoints)}
                  fillOpacity={0.8}
                  fillColor={color}
                  color="#333"
                  weight={1}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-medium">{location.city}</div>
                      <div>Average AQI: {location.aqi.toFixed(1)}</div>
                      <div>Data Points: {location.dataPoints}</div>
                      <div className="mt-2">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-1" 
                          style={{ backgroundColor: color }}
                        ></span>
                        {label}
                      </div>
                    </div>
                  </Popup>    
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Map Legend (Matches Health Risk)</h4>
          <div className="flex flex-wrap gap-4">
            {[
              { range: '0-1', label: 'Good', color: '#a8e05f' },
              { range: '1-2', label: 'Moderate', color: '#fdd64b' },
              { range: '2-3', label: 'Unhealthy for Sensitive Groups', color: '#ff9b57' },
              { range: '3-4', label: 'Unhealthy', color: '#fe6a69' },
              { range: '4+', label: 'Very Unhealthy', color: '#a97abc' }
            ].map((item) => (
              <div key={item.label} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs">
                  {item.label} ({item.range})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  export default RenderHeatmap;