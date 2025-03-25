# Air Quality Detection, Prediction and Health Risk System

A full-stack application for air quality analysis with a React frontend and a Python (Flask + ML) backend.

## Installation

### Frontend (React) Setup
1. Navigate to the React project folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install react react-dom react-router-dom react-leaflet leaflet d3 recharts sweetalert2 tailwindcss @tailwindcss/vite
   ```

### Backend (Python) Setup
1. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   ```
   - **On Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **On macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```
2. Install dependencies:
   ```bash
   pip install pandas numpy scikit-learn flask flask-cors flask-compress python-dotenv
   ```

### Dataset
Place the dataset file in the `assets/` directory:
```
assets/updated_air_quality.csv
```

## Running the Application

1. Train the machine learning model:
   ```bash
   python train_model.py
   ```
2. Start the Flask backend server:
   ```bash
   python python_app.py
   ```
3. In a separate terminal, start the React frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Access the Application
- React Frontend: [http://localhost:5173](http://localhost:5173)
- Flask Backend API: [http://localhost:5000](http://localhost:5000)

## Project Structure
```
project-root/
├── frontend/         # React application
│   ├── public/       # Static files
│   └── src/          # React components
├── venv/             # Python virtual environment
├── assets/           # Dataset storage
│   └── updated_air_quality.csv
├── train_model.py    # ML model training script
├── python_app.py     # Flask API server
└── README.md         # Project documentation
```


