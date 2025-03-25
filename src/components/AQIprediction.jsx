import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie , Cell} from 'recharts';

function AQIprediction({filteredData, predictions, selectedCity, selectedMonth, 
    formatDate, getChartData, metrics, uniqueDaysAnalyzed
}) {
  return (
    <div>
        <div className="mb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">
            AQI Prediction for {selectedCity} {selectedMonth !== 'All Months' ? `- ${selectedMonth}` : ''}
            </h3>
            <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
                dataKey="datetime" 
                tickFormatter={(value) => {
                try {
                    return new Date(value).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                    });
                } catch {
                    return '';
                }
                }}
            />
            <YAxis />
            <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value, name) => [`${value.toFixed(2)}`, name]}
            />
            <Legend />
            <Line 
                type="monotone" 
                dataKey="main.aqi" 
                stroke="#8884d8" 
                name="Actual AQI"
                strokeWidth={2}
                dot={true}
                isAnimationActive={false}
                activeDot={{ r: 6 }}
                connectNulls
            />
            <Line 
                type="monotone" 
                dataKey={(d) => d.is_prediction ? d['main.aqi'] : null}
                stroke="#ff7300" 
                name="Predicted AQI"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={true}
                isAnimationActive={false}
                activeDot={{ r: 6 }}
                connectNulls
            />
            </LineChart>
            </ResponsiveContainer>
            </div>

            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Data Sample</h4>
                <p className="text-xs">Historical data points: {filteredData.length}</p>
                <p className="text-xs">Prediction data points: {predictions.length}</p>
                <p className="text-xs">First prediction date: {formatDate(predictions[0]?.datetime)}</p>
                <p className="text-xs">Last historical date: {formatDate(filteredData[filteredData.length-1]?.datetime)
                }</p>
            </div>
            <div className="mt-4 text-sm text-gray-500">
            <p>This chart shows the historical and predicted AQI values. Predictions are based on machine learning models trained on past air quality data.</p>
            </div>
        </div>
        
        {/* Additional prediction visualizations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-2">AQI Distribution</h3>
            <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 20, bottom: 20, left: 20 }}>
                <Pie
                    data={[
                    { name: 'Good', range: '0-1', value: filteredData.filter(d => Number(d?.['main.aqi']) <= 1).length },
                    { name: 'Moderate', range: '1-2', value: filteredData.filter(d => {
                        const aqi = Number(d?.['main.aqi']);
                        return aqi > 1 && aqi <= 2;
                    }).length },
                    { name: 'Sensitive', range: '2-3', value: filteredData.filter(d => {
                        const aqi = Number(d?.['main.aqi']);
                        return aqi > 2 && aqi <= 3;
                    }).length },
                    { name: 'Unhealthy', range: '3-4', value: filteredData.filter(d => {
                        const aqi = Number(d?.['main.aqi']);
                        return aqi > 3 && aqi <= 4;
                    }).length },
                    { name: 'Very Unhealthy', range: '4+', value: filteredData.filter(d => Number(d?.['main.aqi']) > 4).length }
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, range, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                    if (isNaN(percent)) return null;
                    
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    return (
                        <g>
                        <text 
                            x={x} 
                            y={y - 10} 
                            textAnchor="middle" 
                            fill="#333" 
                            fontSize={12}
                            fontWeight="bold"
                        >
                            {name}
                        </text>
                        <text 
                            x={x} 
                            y={y + 10} 
                            textAnchor="middle" 
                            fill="#666" 
                            fontSize={10}
                        >
                            {`${range} (${(percent * 100).toFixed(0)}%)`}
                        </text>
                        </g>
                    );
                    }}
                    labelLine={false}
                >
                    {['#a8e05f', '#fdd64b', '#ff9b57', '#fe6a69', '#a97abc'].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} stroke="#fff" strokeWidth={1} />
                    ))}
                </Pie>
                <Tooltip 
                    formatter={(value, name, props) => {
                    const total = filteredData.length;
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                    return [`${value} days (${percentage}%)`, `${name} ${props.payload.range}`];
                    }}
                />
                </PieChart>
            </ResponsiveContainer>
            </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-2">Air Quality Summary</h3>
            <div className="h-64 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">Average AQI</p>
                    <p className="text-2xl font-bold text-gray-800">
                    {filteredData.length > 0 
                        ? (filteredData.reduce((sum, item) => sum + item['main.aqi'], 0) / filteredData.length).toFixed(1) 
                        : 'N/A'}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">Maximum AQI</p>
                    <p className="text-2xl font-bold text-gray-800">
                    {filteredData.length > 0 
                        ? Math.max(...filteredData.map(item => item['main.aqi'])).toFixed(1) 
                        : 'N/A'}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">Days Analyzed</p>
                    <p className="text-2xl font-bold text-gray-800">
                    {uniqueDaysAnalyzed || 'N/A'}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500">Primary Pollutant</p>
                    <p className="text-2xl font-bold text-gray-800">
                    {metrics.primary_pollutant || 'N/A'}
                    </p>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
  )
}

export default AQIprediction