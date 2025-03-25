import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import pickle
import os

print("Starting AQI model training...")

# Check if data file exists
data_path = "assets/updated_air_quality.csv"
if not os.path.exists(data_path):
    print(f"Error: Data file not found at {data_path}")
    print("Please ensure the data file is in the correct location.")
    exit(1)

# Load and preprocess data
print("Loading and preprocessing data...")
try:
    df = pd.read_csv(data_path)
    df['datetime'] = pd.to_datetime(df['datetime'])
    
    # Extract time features
    df['hour'] = df['datetime'].dt.hour
    df['day'] = df['datetime'].dt.day
    df['month'] = df['datetime'].dt.month
    df['day_of_week'] = df['datetime'].dt.dayofweek
    
    # Define features and target
    features = ['components.co', 'components.no', 'components.no2',
                'components.o3', 'components.so2', 'components.pm2_5',
                'components.pm10', 'components.nh3', 'hour', 'day',
                'month', 'day_of_week']
    
    target = 'main.aqi'
    
    # Drop rows with missing values
    df = df.dropna(subset=features + [target])
    
    X = df[features]
    y = df[target]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    print("Training RandomForest model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate model
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    
    print(f"Model R² score on training data: {train_score:.4f}")
    print(f"Model R² score on test data: {test_score:.4f}")
    
    # Save model and scaler
    print("Saving model and scaler...")
    with open('aqi_model.pkl', 'wb') as file:
        pickle.dump(model, file)
    
    with open('aqi_scaler.pkl', 'wb') as file:
        pickle.dump(scaler, file)
    
    print("Model training complete!")
    print("Files saved: aqi_model.pkl, aqi_scaler.pkl")
    
except Exception as e:
    print(f"An error occurred during model training: {str(e)}")