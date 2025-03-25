import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'; 

function PollutionComponents({pollutants, selectedCity, selectedMonth}) {
  return (
    <div>
    <div className="mb-4">
        <h3 className="text-md font-medium text-gray-700 mb-2">
        Pollutant Components for {selectedCity} {selectedMonth !== 'All Months' ? `- ${selectedMonth}` : ''}
        </h3>
        <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pollutants} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip formatter={(value) => [value.toFixed(2), "Concentration"]} />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" name="Average Concentration" />
            </BarChart>
        </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-500">
        <p>This chart shows the average concentration of different pollutants in the selected location and time period.</p>
        <ul className="mt-2 list-disc list-inside">
            <li>PM2.5 & PM10: Fine particulate matter</li>
            <li>CO: Carbon monoxide</li>
            <li>NO2 & NO: Nitrogen dioxide/oxide</li>
            <li>O3: Ozone</li>
            <li>SO2: Sulfur dioxide</li>
            <li>NH3: Ammonia</li>
        </ul>
        </div>
    </div>

    {/* Radar Chart for Pollutant Comparison */}
    <div className="mt-8">
        <h3 className="text-md font-medium text-gray-700 mb-2">Pollutant Radar Analysis</h3>
        <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={90} data={pollutants}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
            <Radar name="Pollutant Levels" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Legend />
            <Tooltip formatter={(value) => [value.toFixed(2), "Concentration"]} />
            </RadarChart>
        </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-500">
        <p>This radar chart visualizes the relative concentrations of different pollutants, making it easier to identify which pollutants are most prevalent in the selected area.</p>
        </div>
    </div>
    </div>
  )
}

export default PollutionComponents