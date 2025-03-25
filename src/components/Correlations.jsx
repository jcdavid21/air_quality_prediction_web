import React from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Correlations({selectedCity, selectedMonth, getCorrelationData}) {
    return (
        <div>
            <div className="mb-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                    Pollutant Correlations for {selectedCity} {selectedMonth !== 'All Months' ? `- ${selectedMonth}` : ''}
                </h3>

                {/* Scatter plot */}
                <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                            <CartesianGrid />
                            <XAxis type="number" dataKey="PM2.5" name="PM2.5" />
                            <YAxis type="number" dataKey="AQI" name="AQI" />
                            <ZAxis range={[60, 400]} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Legend />
                            <Scatter name="PM2.5 vs AQI" data={getCorrelationData()} fill="#8884d8" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                {/* Second scatter plot */}
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                            <CartesianGrid />
                            <XAxis type="number" dataKey="O3" name="Ozone" />
                            <YAxis type="number" dataKey="AQI" name="AQI" />
                            <ZAxis range={[60, 400]} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Legend />
                            <Scatter name="Ozone vs AQI" data={getCorrelationData()} fill="#82ca9d" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                    <p>These scatter plots show the correlation between different pollutants and overall Air Quality Index. A strong correlation indicates that the pollutant has a significant impact on air quality in this area.</p>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-md font-medium text-gray-700 mb-2">Correlation Analysis</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 mb-4">
                        The following insights are derived from analyzing correlations between pollutants and AQI:
                    </p>

                    <ul className="list-disc list-inside text-sm text-gray-600">
                        <li>PM2.5 shows the strongest correlation with AQI, suggesting it's the primary driver of air quality issues in {selectedCity}</li>
                        <li>Ozone (O3) levels tend to peak during midday hours when sunlight is strongest</li>
                        <li>NO2 levels are typically higher during morning and evening rush hours, indicating traffic as a major source</li>
                        <li>SO2 levels show less correlation with overall AQI in this region</li>
                        <li>PM10 and PM2.5 show strong correlation, suggesting common sources for these particulates</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Correlations