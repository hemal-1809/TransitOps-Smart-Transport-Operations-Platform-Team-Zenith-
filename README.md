
# TransitOps: Smart Transport Operations Platform (Team Zenith)

TransitOps is a comprehensive, state-of-the-art fleet and transport operations management platform designed to optimize and streamline transport logistics, fleet maintenance, driver safety, fuel tracking, and trip dispatching.

---

## 🚀 Key Features

- **Real-time Dashboard**: Comprehensive analytics, alerts, metrics, and operation tracking.
- **Vehicle Registry**: Detailed logs of vehicles, status, and health indicators.
- **Trip Dispatcher**: Dynamic scheduling, live dispatch controls, and trip logs.
- **Drivers & Safety**: Logs of driver details, performance ratings, and safety alerts.
- **Maintenance & Logs**: Scheduled maintenance, service logs, and expense tracking.
- **Fuel Tracking & Expenses**: Monitoring fuel transactions, efficiency, and cost trends.
- **Reports & Analytics**: Custom PDF/CSV reports generation, filterable tables, and charts.
- **RBAC Settings**: Role-Based Access Control configuration to manage access for Admin, Dispatcher, Driver, and Auditor roles.

---

## 🛠️ Project Structure
```text
TransitOps-Smart-Transport-Operations-Platform-Team-Zenith-/
├── Backend/                 # Flask Backend Application
│   ├── models/              # Database models (User, Vehicle, Trip, Driver, etc.)
│   ├── routes/              # API Route Handlers (Auth, Dashboard, Trip, etc.)
│   ├── app.py               # Main Flask application entry point
│   ├── config.py            # Configuration settings
│   └── requirements.txt     # Python backend dependencies
├── Frontend/                # Vite + React Frontend Application
│   ├── src/                 # Source components & React Context
│   ├── package.json         # Frontend configuration and scripts
│   └── vite.config.js       # Vite configuration
└── README.md                # Main repository documentation
```

---

## 💻 Tech Stack

- **Frontend**: React (Vite), TailwindCSS / Vanilla CSS, React Router, Context API, Lucide Icons, Chart.js.
- **Backend**: Python, Flask, Flask-SQLAlchemy (MySQL), Flask-Login, Flask-Migrate, Flask-CORS.

---

## ⚙️ Setup and Installation

### 1. Backend Setup (Flask)
Navigate to the `Backend` directory:
```bash
cd Backend
```

**Step 1: Create and Activate Virtual Environment**
* **Windows**:
  ```powershell
  python -m venv venv
  .\venv\Scripts\activate
  ```
* **macOS/Linux**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

**Step 2: Install Dependencies**
```bash
pip install -r requirements.txt
```

**Step 3: Database & Environment Configuration**
Create a `.env` file in the `Backend` folder:
```env
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=mysql+pymysql://username:password@localhost/transitops_db
SECRET_KEY=your_secret_key_here
```

**Step 4: Run the Backend**
```bash
flask run
```

---

### 2. Frontend Setup (React/Vite)
Navigate to the `Frontend` directory:
```bash
cd Frontend
```

**Step 1: Install Dependencies**
```bash
npm install
```

**Step 2: Configuration**
Rename `.env.example` to `.env.local` and add your keys:
```env
VITE_API_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**Step 3: Run the Development Server**
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 👥 Contributors (Team Zenith)
Developed with passion by Team Zenith.
Members:
Hemal Mistry
Het Mehta
Maitri Parmar
Anushree Tripathi
