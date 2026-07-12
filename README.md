# TransitOps: Smart Transport Operations Platform (Team Zenith)

TransitOps is a comprehensive, state-of-the-art fleet and transport operations management platform designed to optimize and streamline transport logistics, fleet maintenance, driver safety, fuel tracking, and trip dispatching. It is tailored specifically for Indian road transport and logistics environments.

---

## 🛠️ Project Structure

```text
TransitOps-Smart-Transport-Operations-Platform-Team-Zenith-/
├── Backend/                 # Flask Backend Application
│   ├── models/              # Database Models (User, Vehicle, Trip, Driver, FuelLog, etc.)
│   ├── routes/              # API Route Blueprints (Auth, Dashboard, Trip, Maintenance, etc.)
│   ├── app.py               # Main Flask application entry point
│   ├── config.py            # Dynamic configuration loader
│   ├── config.json          # Preconfigured SQL & SMTP secret keys
│   └── requirements.txt     # Python backend dependencies
├── Frontend/                # Vite + React Frontend Application
│   ├── src/                 # Source components & React Context
│   │   ├── components/      # View layouts (Dashboard, VehicleRegistry, SettingsRBAC, etc.)
│   │   ├── context/         # React Context Provider (TransitContext.jsx)
│   │   ├── index.css        # Core custom styling rules
│   │   └── main.jsx         # App mounting point
│   ├── server.ts            # Node Express Wrapper & Gemini API proxy router
│   ├── package.json         # Frontend configuration and scripts
│   └── vite.config.js       # Vite bundler configuration
└── README.md                # Main repository documentation (this file)
```

---

## 💻 Tech Stack

- **Frontend**: React (Vite), JavaScript / TypeScript, Tailwind CSS, React Context API, Lucide Icons, Chart.js.
- **Backend**: Python, Flask, Flask-SQLAlchemy (MySQL), Flask-CORS, PyMySQL.
- **AI Engine**: Google Gemini API (`gemini-3.5-flash`) via `@google/genai`.

---

## ⚙️ Setup and Installation

### 1. Database & Backend Setup (Flask)

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

**Step 2: Install Python Dependencies**
```bash
pip install -r requirements.txt
```

**Step 3: Database Credentials**
Ensure your local MySQL instance is running. Define your connection parameters inside `Backend/config.json`:
```json
"SQLALCHEMY_DATABASE_URI": "mysql+pymysql://<db_user>:<db_password>@<db_host>:<db_port>/Transitops"
```
*If you need to change your local MySQL username or password, please edit `config.json`.*

**Step 4: Run the Backend Application**
```bash
python app.py
```
*On boot, the application automatically verifies the database, instantiates all schema tables, and populates them with initial mock records.*

---

### 2. Frontend Setup (React/Vite)

Navigate to the `Frontend` directory:
```bash
cd ../Frontend
```

**Step 1: Install Node Dependencies**
```bash
npm install
```

**Step 2: Create Environment variables**
Create a new file named `.env` in the `Frontend/` folder to host your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
```

**Step 3: Start the Server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Preseeded Demonstration Accounts

You can sign in using one of the preconfigured demonstration accounts:

* **Fleet Manager**: `manager@transitops.com`
* **Dispatcher**: `dispatcher@transitops.com`
* **Safety Officer**: `safety@transitops.com`
* **Financial Analyst**: `finance@transitops.com`

---

## 👥 Contributors (Team Zenith)

Developed with passion by Team Zenith:
- **Hemal Mistry**
- **Het Mehta**
- **Maitri Parmar**
- **Anushree Tripathi**
