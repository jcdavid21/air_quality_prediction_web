# api.py - Flask API to serve the React frontend

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler
import pickle
from functools import lru_cache
from flask_compress import Compress
import json
from pathlib import Path

import logging
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Custom JSON encoder to handle NaN values and NumPy types
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            # Handle NaN and Infinity values
            if np.isnan(obj):
                return None
            if np.isinf(obj):
                return None
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.bool_):
            return bool(obj)
        if isinstance(obj, pd.Timestamp):
            return obj.isoformat()
        if pd.isna(obj):
            return None
        return super(CustomJSONEncoder, self).default(obj)

app = Flask(__name__)
app.json_encoder = CustomJSONEncoder  # Use custom encoder
Compress(app)  # Add compression to responses
CORS(app)  # Enable CORS for all routes

# Load the prediction model
@lru_cache(maxsize=1)
def load_model():
    try:
        print("Attempting to load model files...")
        with open('aqi_model.pkl', 'rb') as file:
            model = pickle.load(file)
            print("Model loaded successfully")
        with open('aqi_scaler.pkl', 'rb') as file:
            scaler = pickle.load(file)
            print("Scaler loaded successfully")
        return model, scaler
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        return None, None

# Load and preprocess data with caching
@lru_cache(maxsize=1)
def load_data():
    try:
        current_dir = Path(__file__).parent
        csv_path = current_dir / "assets" / "updated_air_quality.csv"
        
        print(f"Looking for CSV at: {csv_path}")
        
        if not csv_path.exists():
            raise FileNotFoundError(f"CSV file not found at {csv_path}")

        # Load data with explicit datetime parsing
        df = pd.read_csv(
            csv_path,
            parse_dates=['datetime'],
            date_format='mixed'  # Handles multiple datetime formats
        )
        
        # Handle timezone conversion properly
        if df['datetime'].dt.tz is not None:
            # Data already has timezone - convert to Asia/Manila
            df['datetime'] = df['datetime'].dt.tz_convert('Asia/Manila')
        else:
            # Data has no timezone - localize to Asia/Manila
            df['datetime'] = df['datetime'].dt.tz_localize('Asia/Manila')
        
        # Validate data
        if df.empty:
            raise ValueError("Loaded empty DataFrame")
            
        print(f"Successfully loaded {len(df)} records")
        print(f"Date range: {df['datetime'].min()} to {df['datetime'].max()}")
        print(f"Timezone info: {df['datetime'].dt.tz}")

        print("\nSample May data:")
        print(df[df['datetime'].dt.month == 5].head(3))
        
        print("\nDate ranges by month:")
        print(df.groupby(df['datetime'].dt.month)['datetime'].agg(['min', 'max', 'count']))
        
        return df
        
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        print(traceback.format_exc())
        return None

@app.route('/api/docs/historical', methods=['GET'])
def historical_docs():
    """Returns documentation for the historical data endpoint
    ---
    parameters:
      - name: city
        in: query
        type: string
        required: false
        default: all
      - name: page
        in: query
        type: integer
        required: false
        default: 1
      - name: per_page
        in: query
        type: integer
        required: false
        default: 100
      - name: fields
        in: query
        type: string
        required: false
        description: Comma-separated list of fields to return
    responses:
      200:
        description: Historical air quality data
        schema:
          type: object
          properties:
            data:
              type: array
              items:
                type: object
                properties:
                  datetime:
                    type: string
                    format: date-time
                  # other properties...
      400:
        description: Invalid request parameters
      500:
        description: Server error
    """
    return jsonify({
        'message': 'See the API documentation for proper usage',
        'datetime_format': 'ISO 8601 (YYYY-MM-DDTHH:MM:SS)'
    })

# Pre-calculate aggregated data
@lru_cache(maxsize=1)
def get_aggregated_data():
    df = load_data()
    if df is None:
        return None
    
    cities = df['city_name'].unique()
    aggregated_data = {}
    
    # Define pollutant columns once
    pollutant_cols = ['components.co', 'components.no', 'components.no2', 
                      'components.o3', 'components.so2', 'components.pm2_5', 
                      'components.pm10', 'components.nh3']
    
    for city in cities:
        city_df = df[df['city_name'] == city]
        
        # Calculate pollutant means
        pollutant_means = {col.split('.')[-1].upper(): float(city_df[col].mean()) for col in pollutant_cols}
        
        # Calculate trend
        city_df_sorted = city_df.sort_values('datetime')
        if len(city_df_sorted) >= 2:
            first_aqi = float(city_df_sorted.iloc[0]['main.aqi'])
            last_aqi = float(city_df_sorted.iloc[-1]['main.aqi'])
            trend = 'Worsening' if last_aqi > first_aqi else 'Improving'
        else:
            trend = 'Stable'
        
        # Store aggregated data
        aggregated_data[city] = {
            'average_aqi': float(city_df['main.aqi'].mean()),
            'pollutants': pollutant_means,
            'primary_pollutant': max(pollutant_means.items(), key=lambda x: x[1])[0],
            'trend': trend
        }
    
    # Also add an 'all' city aggregation
    all_avg_aqi = float(df['main.aqi'].mean())
    all_pollutant_means = {col.split('.')[-1].upper(): float(df[col].mean()) for col in pollutant_cols}
    all_primary_pollutant = max(all_pollutant_means.items(), key=lambda x: x[1])[0]
    
    df_sorted = df.sort_values('datetime')
    if len(df_sorted) >= 2:
        all_first_aqi = float(df_sorted.iloc[0]['main.aqi'])
        all_last_aqi = float(df_sorted.iloc[-1]['main.aqi'])
        all_trend = 'Worsening' if all_last_aqi > all_first_aqi else 'Improving'
    else:
        all_trend = 'Stable'
    
    aggregated_data['all'] = {
        'average_aqi': all_avg_aqi,
        'pollutants': all_pollutant_means,
        'primary_pollutant': all_primary_pollutant,
        'trend': all_trend
    }
    
    return aggregated_data

@app.route('/api/cities', methods=['GET'])
def get_cities():
    try:
        df = load_data()
        if df is None:
            return jsonify({'error': 'Data not loaded', 'details': 'Check server logs'}), 500
            
        if 'city_name' not in df.columns:
            return jsonify({'error': 'Data format error', 'details': 'city_name column missing'}), 500
            
        cities = df['city_name'].unique().tolist()
        return jsonify(cities)
        
    except Exception as e:
        logger.error(f"Error in get_cities: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

@app.route('/api/historical', methods=['GET'])
def get_historical_data():
    try:
        df = load_data()
        if df is None:
            return jsonify({'error': 'Data not available'}), 500

        city = request.args.get('city', 'all')
        month = request.args.get('month', None)
        
        # Make a copy to avoid SettingWithCopyWarning
        df = df.copy()

        # Ensure datetime is in proper format and Manila timezone
        if not pd.api.types.is_datetime64_any_dtype(df['datetime']):
            df['datetime'] = pd.to_datetime(df['datetime'], errors='coerce')
        
        # Convert to Manila timezone if not already
        if df['datetime'].dt.tz is None:
            df['datetime'] = df['datetime'].dt.tz_localize('Asia/Manila')
        else:
            df['datetime'] = df['datetime'].dt.tz_convert('Asia/Manila')

        # Filter by city if specified
        if city != 'all':
            df = df[df['city_name'] == city]

        # Filter by month if specified (1-12)
        if month and month.isdigit():
            month_num = int(month)
            if 1 <= month_num <= 12:
                # Filter using Manila timezone
                df = df[df['datetime'].dt.month == month_num]

        # Convert to records with proper date formatting
        records = []
        for _, row in df.iterrows():
            record = row.to_dict()
            # Convert datetime to ISO format with timezone
            record['datetime'] = row['datetime'].isoformat()
            records.append(record)

        return jsonify({
            'data': records,
            'timezone': 'Asia/Manila',
            'date_range': {
                'start': df['datetime'].min().isoformat() if not df.empty else None,
                'end': df['datetime'].max().isoformat() if not df.empty else None
            }
        })

    except Exception as e:
        logger.error(f"Error in historical data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    try:
        model, scaler = load_model()
        if model is None or scaler is None:
            return jsonify({'error': 'Model or scaler not loaded', 'details': 'Check model files'}), 500

        df = load_data()
        if df is None:
            return jsonify({'error': 'Data not loaded'}), 500

        city = request.args.get('city', 'all')
        days = int(request.args.get('days', '7'))

        # Get the most recent data point for each city
        if city == 'all':
            last_points = df.sort_values('datetime').groupby('city_name').last().reset_index()
        else:
            last_points = df[df['city_name'] == city].sort_values('datetime').tail(1)

        if len(last_points) == 0:
            return jsonify({'error': 'No data available for prediction'}), 404

        # Generate future dates starting from tomorrow
        last_date = pd.to_datetime(last_points['datetime'].max())
        future_dates = pd.date_range(
            start=last_date + timedelta(days=1),
            periods=days,
            freq='D'
        )

        predictions = []
        features = ['components.co', 'components.no', 'components.no2',
                   'components.o3', 'components.so2', 'components.pm2_5',
                   'components.pm10', 'components.nh3']

        for _, row in last_points.iterrows():
            # Create baseline data for predictions
            base_data = row[features].to_dict()
            
            for date in future_dates:
                # Create input features
                input_data = {
                    **base_data,
                    'hour': date.hour,
                    'day': date.day,
                    'month': date.month,
                    'day_of_week': date.dayofweek
                }
                
                # Convert to DataFrame for scaling
                input_df = pd.DataFrame([input_data])
                
                try:
                    # Scale features
                    X_scaled = scaler.transform(input_df)
                    
                    # Make prediction
                    predicted_aqi = model.predict(X_scaled)[0]
                    
                    # Create prediction record
                    prediction = {
                        'datetime': date.isoformat(),
                        'predicted_aqi': float(predicted_aqi),
                        'city_name': row['city_name'],
                        'lat': row['lat'],
                        'lon': row['lon'],
                        'is_prediction': True
                    }
                    predictions.append(prediction)
                    
                except Exception as e:
                    print(f"Prediction error for {row['city_name']} on {date}: {str(e)}")
                    continue

        return jsonify(predictions)

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': 'Prediction failed', 'details': str(e)}), 500

@app.route('/api/pollutants', methods=['GET'])
def get_pollutant_data():
    aggregated_data = get_aggregated_data()
    if aggregated_data is None:
        return jsonify({'error': 'Data not available'}), 500
    
    city = request.args.get('city', 'all')
    
    if city in aggregated_data:
        return jsonify(aggregated_data[city]['pollutants'])
    else:
        return jsonify({'error': 'City not found'}), 404

@app.route('/api/health-risk', methods=['GET'])
def get_health_risk():
    df = load_data()
    if df is None:
        return jsonify({'error': 'Data not available'}), 500
    
    city = request.args.get('city', 'all')
    
    if city != 'all':
        df = df[df['city_name'] == city]
    
    # Get the latest AQI
    latest_data = df.sort_values('datetime', ascending=False).iloc[0]
    aqi = float(latest_data['main.aqi'])
    
    # Determine health risk level
    if aqi <= 1:
        risk = {
            'level': 'Good',
            'color': 'green',
            'description': 'Air quality is considered satisfactory, and air pollution poses little or no risk.'
        }
    elif aqi <= 2:
        risk = {
            'level': 'Moderate',
            'color': 'yellow',
            'description': 'Air quality is acceptable; however, some pollutants may be a concern for a small number of people.'
        }
    elif aqi <= 3:
        risk = {
            'level': 'Unhealthy for Sensitive Groups',
            'color': 'orange',
            'description': 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.'
        }
    elif aqi <= 4:
        risk = {
            'level': 'Unhealthy',
            'color': 'red',
            'description': 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.'
        }
    else:
        risk = {
            'level': 'Very Unhealthy',
            'color': 'purple',
            'description': 'Health warnings of emergency conditions. The entire population is more likely to be affected.'
        }
    
    return jsonify(risk)

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    aggregated_data = get_aggregated_data()
    if aggregated_data is None:
        return jsonify({'error': 'Data not available'}), 500
    
    city = request.args.get('city', 'all')
    
    if city in aggregated_data:
        metrics = {
            'average_aqi': aggregated_data[city]['average_aqi'],
            'primary_pollutant': aggregated_data[city]['primary_pollutant'],
            'trend': aggregated_data[city]['trend']
        }
        return jsonify(metrics)
    else:
        return jsonify({'error': 'City not found'}), 404

@app.route('/api/historical/daily', methods=['GET'])
def get_daily_historical_data():
    try:
        df = load_data()
        if df is None:
            return jsonify({'error': 'Data not available'}), 500

        city = request.args.get('city', 'all')
        month = request.args.get('month', None)
        
        if city != 'all':
            df = df[df['city_name'] == city]

        # Convert to Manila timezone if not already
        if df['datetime'].dt.tz is None:
            df['datetime'] = df['datetime'].dt.tz_localize('Asia/Manila')
        else:
            df['datetime'] = df['datetime'].dt.tz_convert('Asia/Manila')

        # Filter by month if specified
        if month and month.isdigit():
            month_num = int(month)
            if 1 <= month_num <= 12:
                df = df[df['datetime'].dt.month == month_num]

        # Create date column (without time)
        df['date'] = df['datetime'].dt.date

        # Group by date and calculate daily averages
        daily_avg = df.groupby('date').agg({
            'main.aqi': 'mean',
            'components.pm2_5': 'mean',
            'components.pm10': 'mean',
            'components.o3': 'mean',
            'components.no2': 'mean',
            'components.so2': 'mean',
            'lat': 'first',
            'lon': 'first',
            'city_name': 'first'
        }).reset_index()

        # Convert to records with proper date formatting
        records = daily_avg.to_dict('records')
        
        return jsonify({
            'data': records,
            'timezone': 'Asia/Manila',
            'date_range': {
                'start': df['datetime'].min().isoformat() if not df.empty else None,
                'end': df['datetime'].max().isoformat() if not df.empty else None
            }
        })

    except Exception as e:
        logger.error(f"Error in daily historical data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/heatmap', methods=['GET'])
def get_heatmap_data():
    try:
        df = load_data()
        if df is None:
            return jsonify({'error': 'Data not available'}), 500
        
        city = request.args.get('city', 'all')
        
        if city != 'all':
            df = df[df['city_name'] == city]
        
        # Ensure we have required columns
        required_cols = ['datetime', 'main.aqi', 'lat', 'lon', 'city_name']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            return jsonify({'error': f'Missing required columns: {missing_cols}'}), 400
        
        # Convert datetime if needed
        if not pd.api.types.is_datetime64_any_dtype(df['datetime']):
            df['datetime'] = pd.to_datetime(df['datetime'])
        
        # Group by city and calculate average AQI and coordinates
        heatmap_data = df.groupby('city_name').agg({
            'main.aqi': 'mean',
            'lat': 'first',
            'lon': 'first',
            'datetime': 'count'  # Count of data points per city
        }).reset_index()
        
        # Rename columns for clarity
        heatmap_data = heatmap_data.rename(columns={
            'main.aqi': 'avg_aqi',
            'datetime': 'data_points'
        })
        
        # Convert to list of dictionaries
        result = heatmap_data.to_dict(orient='records')
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Unexpected error in get_heatmap_data: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Server error: {str(e)}'}), 500
    

# Add a health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'API is running'})

@app.route('/api/predictions/test', methods=['GET'])
def test_predictions():
    test_data = [
        {
            "datetime": (datetime.now() + timedelta(days=1)).isoformat(),
            "predicted_aqi": 2.5,
            "city_name": "Test City",
            "is_prediction": True
        },
        {
            "datetime": (datetime.now() + timedelta(days=2)).isoformat(),
            "predicted_aqi": 3.1,
            "city_name": "Test City",
            "is_prediction": True
        }
    ]
    return jsonify(test_data)



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5500)