import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DailyPatterns({dailyPatterns, selectedCity, selectedMonth}) {
    return (
        <div>
            <div className="mb-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                    Daily AQI Patterns for {selectedCity} {selectedMonth !== 'All Months' ? `- ${selectedMonth}` : ''}
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyPatterns}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip formatter={(value) => [value.toFixed(2), "Average AQI"]} />
                            <Legend />
                            <Line type="monotone" dataKey="aqi" stroke="#8884d8" name="Average Air Quality Index" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                    <p>This chart shows how air quality typically varies throughout the day. Higher values indicate worse air quality.</p>
                </div>
            </div>

            {/* Peak hours analysis */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Peak Hours Analysis</h3>
                    <div className="mt-4">
                        {dailyPatterns.length > 0 && (
                            <>
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-600">Worst Air Quality Hours:</p>
                                    <div className="flex flex-wrap mt-2">
                                        {dailyPatterns
                                            .sort((a, b) => b.aqi - a.aqi)
                                            .slice(0, 5)
                                            .map((item, index) => (
                                                <div key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded mr-2 mb-2 text-sm">
                                                    {item.hour} ({item.aqi.toFixed(2)})
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Best Air Quality Hours:</p>
                                    <div className="flex flex-wrap mt-2">
                                        {dailyPatterns
                                            .sort((a, b) => a.aqi - b.aqi)
                                            .slice(0, 5)
                                            .map((item, index) => (
                                                <div key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2 mb-2 text-sm">
                                                    {item.hour} ({item.aqi.toFixed(2)})
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Air Quality Recommendations</h3>
                    <div className="mt-4">
                        <p className="text-sm text-gray-700">Based on the daily patterns in {selectedCity}, we recommend:</p>
                        <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                            <li>Schedule outdoor activities during hours with the best air quality</li>
                            <li>Keep windows closed during peak pollution hours</li>
                            <li>Use air purifiers during times with poor air quality</li>
                            <li>Consider wearing masks if you must be outside during high pollution periods</li>
                            <li>Check daily forecasts before planning outdoor activities</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DailyPatterns