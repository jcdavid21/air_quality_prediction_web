import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis } from 'recharts';
import * as d3 from 'd3';
import Swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css';
import RenderHeatmap from './RenderHeatMap';
import AQIprediction from './AQIprediction';
import PollutionComponents from './PollutionComponents';
import MonthlyAnalysis from './MonthlyAnalysis';
import DailyPatterns from './DailyPatterns';
import HealthRisk from './HealthRisk';
import Correlations from './Correlations';


const AirQualityDashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [activeTab, setActiveTab] = useState('prediction');
  const [pollutants, setPollutants] = useState([]);
  const [healthRisk, setHealthRisk] = useState({});
  const [metrics, setMetrics] = useState({
    average_aqi: 0,
    primary_pollutant: '',
    trend: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [monthlyAverages, setMonthlyAverages] = useState([]);
  const [dailyPatterns, setDailyPatterns] = useState([]);
  

    
  // Base API URL - change this to your Flask server address
  const API_BASE_URL = 'http://localhost:5500/api';
  
  // Available months
  const months = ['All Months', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
  useEffect(() => {
    // Fetch cities
    const fetchCities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cities`);
        if (!response.ok) throw new Error('Failed to fetch cities');
        
        const citiesData = await response.json();
        setCities(['All Cities', ...citiesData]);
      } catch (err) {
        setError('Error loading cities: ' + err.message);
        console.error('Error loading cities:', err);
      }
    };
    fetchCities();
  }, []);
  
  
  useEffect(() => {
    const fetchData = async () => {
      // Show loading alert
      Swal.fire({
        title: 'Loading Data',
        html: 'Fetching air quality information...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    
      setLoading(true);
      setError(null);
    
      try {
        const cityParam = selectedCity === 'All Cities' ? 'all' : encodeURIComponent(selectedCity);
    
        // Fetch aggregated daily data instead of raw data
        const [dailyResponse, predictionsResponse, pollutantsResponse, 
              healthRiskResponse, metricsResponse, heatmapResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/historical/daily?city=${cityParam}`),
          fetch(`${API_BASE_URL}/predictions?city=${cityParam}&days=7`),
          fetch(`${API_BASE_URL}/pollutants?city=${cityParam}`),
          fetch(`${API_BASE_URL}/health-risk?city=${cityParam}`),
          fetch(`${API_BASE_URL}/metrics?city=${cityParam}`),
          fetch(`${API_BASE_URL}/heatmap?city=${cityParam}`)
        ]);
    
        if (!dailyResponse.ok) throw new Error('Failed to fetch daily data');
        // Check for errors in responses
        if (!predictionsResponse.ok) throw new Error('Failed to fetch predictions');
        if (!pollutantsResponse.ok) throw new Error('Failed to fetch pollutant data');
        if (!healthRiskResponse.ok) throw new Error('Failed to fetch health risk');
        if (!metricsResponse.ok) throw new Error('Failed to fetch metrics');
        
        const dailyData = await dailyResponse.json();
        const predictionsData = await predictionsResponse.json();
        // Process responses
        const pollutantsData = await pollutantsResponse.json();
        const healthRiskData = await healthRiskResponse.json();
        const metricsData = await metricsResponse.json();
        const heatmapData = heatmapResponse.ok ? await heatmapResponse.json() : [];

        const processedDailyData = dailyData.data.map(item => ({
          ...item,
          datetime: new Date(item.date).toISOString(), // Convert back to datetime format
          'main.aqi': item['main.aqi'],
          'components': {
            pm2_5: item['components.pm2_5'],
            pm10: item['components.pm10'],
            o3: item['components.o3'],
            no2: item['components.no2'],
            so2: item['components.so2']
          }
        }));
        
        const formattedPredictions = Array.isArray(predictionsData)
          ? predictionsData.map(pred => ({
              ...pred,
              datetime: pred.datetime,
              'main.aqi': pred.predicted_aqi,
              is_prediction: true
            }))
          : [];
    

    
        // Map API color to Tailwind color class
        const colorMap = {
          'green': 'bg-green-500',
          'yellow': 'bg-yellow-500',
          'orange': 'bg-orange-500',
          'red': 'bg-red-500',
          'purple': 'bg-purple-500'
        };
    
        // Transform pollutant data for chart
        const pollutantsArray = pollutantsData 
          ? Object.entries(pollutantsData).map(([name, value]) => ({
              name,
              value
            }))
          : [];
    
        // Set all state at once to minimize re-renders
        setData(processedDailyData);
        setPredictions(formattedPredictions);
        setPollutants(pollutantsArray);
        setHealthRisk({
          level: healthRiskData.level,
          color: colorMap[healthRiskData.color] || 'bg-blue-500',
          description: healthRiskData.description
        });
        setMetrics(metricsData);
        setHeatmapData(heatmapData);
        
        // Calculate derived data
        calculateMonthlyAverages(processedDailyData);
       calculateDailyPatterns(processedDailyData);
       filterDataByMonth(processedDailyData, selectedMonth);
    
        // Close the loading alert
        Swal.close();
    
      } catch (err) {
        setError('Error loading data: ' + err.message);
        console.error('Error loading data:', err);
        
        // Show error alert
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load data: ' + err.message,
        });
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedCity]);


  const uniqueDaysAnalyzed = new Set(
    filteredData
      .filter(item => item.datetime)
      .map(item => {
        try {
          const date = new Date(item.datetime);
          return date.toLocaleDateString('en-US', { 
            timeZone: 'Asia/Manila' 
          });
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
  ).size;

  const filterDataByMonth = (data, month) => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }
  
    let filtered = data;
  
    // Filter by month if not "All Months"
    if (month !== 'All Months') {
      const monthNumber = months.indexOf(month);
      filtered = filtered.filter(item => {
        try {
          if (!item.datetime) return false;
          const itemDate = new Date(item.datetime);
          if (isNaN(itemDate.getTime())) return false;
          return itemDate.toLocaleString('default', { month: 'short'}) === month;
        } catch (e) {
          console.error('Invalid date:', item.datetime, e);
          return false;
        }
      });
    }
  
    // Filter by city if not "All Cities"
    if (selectedCity !== 'All Cities') {
      filtered = filtered.filter(item => item.city_name === selectedCity);
    }
  
    setFilteredData(filtered);
  };

  useEffect(() => {
    filterDataByMonth(data, selectedMonth);
  }, [selectedMonth, data]);
  
  
  const calculateMonthlyAverages = (dailyData) => {
    const monthlyData = {};
  
    // Group data by month
    dailyData.forEach(item => {
      const date = new Date(item.datetime);
      const month = date.toLocaleString('default', { month: 'short' });
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          aqiSum: 0,
          count: 0
        };
      }
      
      monthlyData[month].aqiSum += item['main.aqi'];
      monthlyData[month].count += 1;
    });
    
    // Calculate averages
    const averages = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      aqi: data.aqiSum / data.count
    }));
    
    // Sort by month order
    const sortedAverages = averages.sort((a, b) => {
      const monthA = new Date(Date.parse(`${a.month} 1, 2000`));
      const monthB = new Date(Date.parse(`${b.month} 1, 2000`));
      return monthA - monthB;
    });
    
    setMonthlyAverages(sortedAverages);
  };
  
  
  const calculateDailyPatterns = (dailyData) => {
    const hourlyData = Array(24).fill().map((_, i) => ({
      hour: i,
      aqi: 0,
      count: 0
    }));

    dailyData.forEach(item => {
      const date = new Date(item.datetime);
      const hour = date.getHours();
      
      hourlyData[hour].aqi += item['main.aqi'];
      hourlyData[hour].count += 1;
    });
    
    const patterns = hourlyData.map(item => ({
      hour: `${item.hour}:00`,
      aqi: item.count > 0 ? item.aqi / item.count : 0
    }));
    
    setDailyPatterns(patterns);
  };
  const getChartData = () => {
    const combined = [
      ...filteredData.map(item => ({
        ...item,
        datetime: new Date(item.datetime),
        type: 'historical',
        is_prediction: false
      })),
      ...predictions.map(item => ({
        ...item,
        datetime: new Date(item.datetime),
        type: 'prediction',
        is_prediction: true
      }))
    ].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  
    return combined;
  };
  
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      // Format with Manila timezone
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        timeZone: 'Asia/Manila'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid Date';
    }
  };
  
  const getCorrelationData = () => {
    return filteredData.map(item => ({
      'PM2.5': item['components.pm2_5'],
      'PM10': item['components.pm10'],
      'O3': item['components.o3'],
      'AQI': item['main.aqi'],
      datetime: formatDate(item.datetime)
    }));
  };
  
  // Update the month change handler
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };
  
  
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow-md p-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">Air Quality Analytics Dashboard</h1>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mr-2">City:</label>
              <select 
                className="p-2 border rounded" 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)} 
                disabled={loading}
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mr-2">Month:</label>
              <select 
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="p-2 border rounded"
                >
                  <option value="All Months">All Months</option>
                  {months.slice(1).map((month, index) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b bg-white">
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'prediction' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('prediction')}
        >
          AQI Prediction
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'components' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('components')}
        >
          Pollution Components
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'monthly' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Analysis
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'patterns' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('patterns')}
        >
          Daily Patterns
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'health' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('health')}
        >
          Health Risk
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'heatmap' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('heatmap')}
        >
          AQI Heatmap
        </button>
        <button 
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'correlations' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('correlations')}
        >
          Pollutant Correlations
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading data...</div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {activeTab === 'prediction' && 'Air Quality Prediction'}
              {activeTab === 'components' && 'Pollution Component Analysis'}
              {activeTab === 'monthly' && 'Monthly AQI Trends'}
              {activeTab === 'patterns' && 'Daily AQI Patterns'}
              {activeTab === 'health' && 'Health Risk Assessment'}
              {activeTab === 'heatmap' && 'AQI Heatmap Visualization'}
              {activeTab === 'correlations' && 'Pollutant Correlations'}
            </h2>
            
            {/* Prediction Tab */}
            {activeTab === 'prediction' && (
              <AQIprediction filteredData={filteredData} predictions={predictions} selectedCity={selectedCity} selectedMonth={selectedMonth} 
              formatDate={formatDate} getChartData={getChartData} metrics={metrics} uniqueDaysAnalyzed={uniqueDaysAnalyzed} />
            )}
            
            {/* Components Tab */}
            {activeTab === 'components' && (
              <PollutionComponents pollutants={pollutants} selectedCity={selectedCity} selectedMonth={selectedMonth} />
            )}
            
            {/* Monthly Analysis Tab */}
            {activeTab === 'monthly' && (
              <MonthlyAnalysis monthlyAverages={monthlyAverages} selectedCity={selectedCity} />
            )}
            
            {/* Daily Patterns Tab */}
            {activeTab === 'patterns' && (
              <DailyPatterns dailyPatterns={dailyPatterns} selectedCity={selectedCity} selectedMonth={selectedMonth} />
            )}
            
            {/* Health Risk Tab */}
            {activeTab === 'health' && (
              <HealthRisk healthRisk={healthRisk}  pollutants={pollutants} selectedCity={selectedCity} />
            )}
            
            {/* Heatmap Tab */}
            {activeTab === 'heatmap' && <RenderHeatmap filteredData={filteredData} heatmapData={heatmapData} 
            selectedCity={selectedCity} selectedMonth={selectedMonth}/>}
            
            {/* Correlations Tab */}
            {activeTab === 'correlations' && (
              <Correlations selectedCity={selectedCity} selectedMonth={selectedMonth} getCorrelationData={getCorrelationData} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AirQualityDashboard;