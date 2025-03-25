import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function MonthlyAnalysis({monthlyAverages, selectedCity}) {
  return (
    <div>
        <div className="mb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">
            Monthly AQI Averages for {selectedCity}
            </h3>
            <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value.toFixed(2), "Average AQI"]} />
                <Legend />
                <Bar dataKey="aqi" fill="#8884d8" name="Average Air Quality Index" />
                </BarChart>
            </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-500">
            <p>This chart shows how air quality varies by month throughout the year. Higher values indicate worse air quality.</p>
            </div>
        </div>
        
        {/* Monthly comparison table */}
        <div className="mt-8">
            <h3 className="text-md font-medium text-gray-700 mb-2">Monthly Comparison</h3>
            <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
                <thead>
                <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average AQI</th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality Level</th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change from Previous</th>
                </tr>
                </thead>
                <tbody>
                {monthlyAverages.map((item, index) => {
                    // Determine quality level
                    let qualityLevel = 'Good';
                    let qualityColor = 'text-green-600';
                    
                    if (item.aqi > 4) {
                    qualityLevel = 'Very Unhealthy';
                    qualityColor = 'text-purple-600';
                    } else if (item.aqi > 3) {
                    qualityLevel = 'Unhealthy';
                    qualityColor = 'text-red-600';
                    } else if (item.aqi > 2) {
                    qualityLevel = 'Unhealthy for Sensitive Groups';
                    qualityColor = 'text-orange-600';
                    } else if (item.aqi > 1) {
                    qualityLevel = 'Moderate';
                    qualityColor = 'text-yellow-600';
                    }
                    
                    // Calculate change from previous month
                    let change = 0;
                    let changeDirection = '';
                    
                    if (index > 0) {
                    change = item.aqi - monthlyAverages[index - 1].aqi;
                    changeDirection = change > 0 ? 'up' : 'down';
                    }
                    
                    return (
                    <tr key={item.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-2 px-4 border-b border-gray-200">{item.month}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{item.aqi.toFixed(2)}</td>
                        <td className={`py-2 px-4 border-b border-gray-200 ${qualityColor}`}>{qualityLevel}</td>
                        <td className="py-2 px-4 border-b border-gray-200">
                        {index > 0 ? (
                            <div className="flex items-center">
                            <span className={changeDirection === 'up' ? 'text-red-600' : 'text-green-600'}>
                                {Math.abs(change).toFixed(2)}
                            </span>
                            <span className={`ml-1 ${changeDirection === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                                {changeDirection === 'up' ? '↑' : '↓'}
                            </span>
                            </div>
                        ) : '-'}
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
            </div>
        </div>
        </div>
  )
}

export default MonthlyAnalysis