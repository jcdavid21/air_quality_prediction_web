import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

function HealthRisk({ healthRisk, pollutants, selectedCity }) {
    return (
        <div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 max-h-64">
                    <div className={`p-4 rounded-lg h-full flex flex-col ${healthRisk.color}`}>
                        <h3 className="text-white text-xl font-medium mb-1">Current Health Risk (Air Quality)</h3>
                        <div className="text-white text-4xl font-bold mb-2">{healthRisk.level}</div>
                        <p className="text-white text-sm mt-auto">{healthRisk.description}</p>
                    </div>

                    {/* Explanation of Pollutant vs. Air Quality Risk */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                        <p className="font-semibold text-gray-800">Why Pollutant Risk ≠ Air Quality?</p>
                        <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-1">
                            <li><strong>CO (Carbon Monoxide)</strong> can be <span className="font-semibold text-red-600">high risk</span> near traffic or factories, but other pollutants may stay low.</li>
                            <li><strong>Air Quality Index (AQI)</strong> averages <em>all</em> pollutants, so one high pollutant won’t always raise the overall risk.</li>
                            <li><strong>Key Scenario:</strong> During <span className="font-medium">rush hour</span>, CO levels may spike, but if PM2.5/O₃ are normal, AQI remains <span className="font-semibold text-green-600">moderate</span>.</li>
                        </ul>
                        <p className="mt-2 text-gray-600 italic">
                            Example: Near a busy highway, <span className="font-medium">CO may be hazardous</span> due to car exhaust, but <span className="font-medium">overall air quality could still be moderate</span> if winds disperse other pollutants.
                        </p>
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Pollutant-Specific Health Precautions</h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    name: 'PM2.5',
                                    risk: 'High Risk',
                                    color: 'bg-red-100 border-red-300',
                                    impacts: [
                                        'Deepest lung penetration',
                                        'Highest respiratory disease risk'
                                    ],
                                    precautions: [
                                        'Use N95 or higher-grade masks',
                                        'Avoid outdoor activities during peaks',
                                        'Use HEPA air purifiers'
                                    ]
                                },
                                {
                                    name: 'PM10',
                                    risk: 'Moderate to High Risk',
                                    color: 'bg-orange-100 border-orange-300',
                                    impacts: [
                                        'Respiratory tract irritation',
                                        'Asthma trigger'
                                    ],
                                    precautions: [
                                        'Wear multi-layer masks',
                                        'Limit outdoor exercises',
                                        'Clean indoor surfaces regularly'
                                    ]
                                },
                                {
                                    name: 'O3',
                                    risk: 'Moderate Risk',
                                    color: 'bg-yellow-100 border-yellow-300',
                                    impacts: [
                                        'Lung inflammation',
                                        'Reduced lung function'
                                    ],
                                    precautions: [
                                        'Avoid midday outdoor activities',
                                        'Use air conditioning',
                                        'Consume antioxidant-rich foods'
                                    ]
                                },
                                {
                                    name: 'NO2',
                                    risk: 'Low to Moderate Risk',
                                    color: 'bg-[#c0beea] border-green-300',
                                    impacts: [
                                        'Respiratory inflammation',
                                        'Increased infection susceptibility'
                                    ],
                                    precautions: [
                                        'Minimize traffic area exposure',
                                        'Ensure indoor ventilation',
                                        'Use masks in urban environments'
                                    ]
                                },
                                {
                                    name: 'SO2',
                                    risk: 'Low Risk',
                                    color: 'bg-[#b8e1c7] border-blue-300',
                                    impacts: [
                                        'Respiratory tract irritation',
                                        'Potential asthma trigger'
                                    ],
                                    precautions: [
                                        'Stay informed about emissions',
                                        'Close windows during events',
                                        'Support clean energy'
                                    ]
                                }
                            ].map((pollutant, index) => (
                                <div
                                    key={index}
                                    className={`border rounded-lg p-4 ${pollutant.color} transition-all hover:shadow-md`}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-semibold text-gray-800">{pollutant.name}</h3>
                                        <span className="text-sm font-medium text-gray-600">{pollutant.risk}</span>
                                    </div>

                                    <div className="mb-3">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Impacts</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {pollutant.impacts.map((impact, i) => (
                                                <li key={i} className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 10l-2.293 2.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                    {impact}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Recommended Precautions</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {pollutant.precautions.map((precaution, i) => (
                                                <li key={i} className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    {precaution}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Risk by Pollutant */}
            <div className="mt-8">
                <h3 className="text-md font-medium text-gray-700 mb-4">Health Risk by Pollutant</h3>

                {/* Bar Chart Section */}
                <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Pollutant Concentration Levels</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={pollutants}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name, props) => {
                                        const getRiskLevel = (name, value) => {
                                            if (name === 'pm2_5') {
                                                if (value <= 12) return 'Good';
                                                if (value <= 35.4) return 'Moderate';
                                                if (value <= 55.4) return 'Unhealthy for Sensitive';
                                                if (value <= 150.4) return 'Unhealthy';
                                                return 'Very Unhealthy';
                                            }
                                            // Add other pollutants...
                                            return 'Moderate';
                                        };
                                        return [
                                            `${value.toFixed(2)} μg/m³`,
                                            `Risk: ${getRiskLevel(props.payload.name, value)}`
                                        ];
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="value"
                                    name="Concentration (μg/m³)"
                                    radius={[4, 4, 0, 0]}
                                >
                                    {pollutants.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={[
                                                '#fe6a69', // PM2.5 - Red
                                                '#ff9b57', // PM10 - Orange
                                                '#fdd64b', // O3 - Yellow
                                                '#8884d8', // NO2 - Purple
                                                '#82ca9d'  // SO2 - Green
                                            ][index % 5]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Color Legend for Bar Chart */}
                    <div className="flex flex-wrap gap-4 mt-4 justify-center">
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded mr-1 bg-[#fe6a69]"></div>
                            <span className="text-xs">PM2.5 (High Risk)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded mr-1 bg-[#ff9b57]"></div>
                            <span className="text-xs">PM10 (Mod-High Risk)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded mr-1 bg-[#fdd64b]"></div>
                            <span className="text-xs">O3 (Moderate Risk)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded mr-1 bg-[#8884d8]"></div>
                            <span className="text-xs">NO2 (Low-Mod Risk)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded mr-1 bg-[#82ca9d]"></div>
                            <span className="text-xs">SO2 (Low Risk)</span>
                        </div>
                    </div>
                </div>

                {/* Existing Table with Colored Lines */}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pollutant</th>
                                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Effects</th>
                                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level in {selectedCity}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white">
                                <td className="py-2 px-4 border-b border-gray-200 font-medium">PM2.5</td>
                                <td className="py-2 px-4 border-b border-gray-200">Can penetrate deep into lungs and bloodstream, causing respiratory and cardiovascular issues</td>
                                <td className="py-2 px-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                                            <div className="h-full bg-red-500" style={{ width: `${Math.min(100, (pollutants.find(p => p.name === 'pm2_5')?.value || 0) / 0.5 * 100)}%` }}></div>
                                        </div>
                                        <span className="ml-2 text-sm text-gray-600">
                                            {pollutants.find(p => p.name === 'pm2_5') ? pollutants.find(p => p.name === 'pm2_5').value.toFixed(2) : 'N/A'}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td className="py-2 px-4 border-b border-gray-200 font-medium">PM10</td>
                                <td className="py-2 px-4 border-b border-gray-200">Can cause respiratory issues, aggravate asthma and allergies</td>
                                <td className="py-2 px-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                                            <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, (pollutants.find(p => p.name === 'pm10')?.value || 0) / 1 * 100)}%` }}></div>
                                        </div>
                                        <span className="ml-2 text-sm text-gray-600">
                                            {pollutants.find(p => p.name === 'pm10') ? pollutants.find(p => p.name === 'pm10').value.toFixed(2) : 'N/A'}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                            <tr className="bg-white">
                                <td className="py-2 px-4 border-b border-gray-200 font-medium">O3 (Ozone)</td>
                                <td className="py-2 px-4 border-b border-gray-200">Can cause respiratory issues, throat irritation, and reduce lung function</td>
                                <td className="py-2 px-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                                            <div className="h-full bg-yellow-500" style={{ width: `${Math.min(100, (pollutants.find(p => p.name === 'o3')?.value || 0) / 1 * 100)}%` }}></div>
                                        </div>
                                        <span className="ml-2 text-sm text-gray-600">
                                            {pollutants.find(p => p.name === 'o3') ? pollutants.find(p => p.name === 'o3').value.toFixed(2) : 'N/A'}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td className="py-2 px-4 border-b border-gray-200 font-medium">NO2</td>
                                <td className="py-2 px-4 border-b border-gray-200">Can irritate airways, worsen asthma and increase susceptibility to respiratory infections</td>
                                <td className="py-2 px-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (pollutants.find(p => p.name === 'no2')?.value || 0) / 2 * 100)}%` }}></div>
                                        </div>
                                        <span className="ml-2 text-sm text-gray-600">
                                            {pollutants.find(p => p.name === 'no2') ? pollutants.find(p => p.name === 'no2').value.toFixed(2) : 'N/A'}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                            <tr className="bg-white">
                                <td className="py-2 px-4 border-b border-gray-200 font-medium">SO2</td>
                                <td className="py-2 px-4 border-b border-gray-200">Can cause respiratory issues and aggravate existing heart disease</td>
                                <td className="py-2 px-4 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                                            <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, (pollutants.find(p => p.name === 'so2')?.value || 0) / 2 * 100)}%` }}></div>
                                        </div>
                                        <span className="ml-2 text-sm text-gray-600">
                                            {pollutants.find(p => p.name === 'so2') ? pollutants.find(p => p.name === 'so2').value.toFixed(2) : 'N/A'}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default HealthRisk