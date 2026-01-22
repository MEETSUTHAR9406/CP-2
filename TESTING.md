# Testing Guide for CP-2 Project

## Prerequisites
- **Python 3.8+** (for Backend)
- **Node.js 16+** (for Frontend) - *Note: It appears Node.js might not be installed or in your PATH. Please download it from [nodejs.org](https://nodejs.org/).*

---

## 1. Backend Setup (Term 1)
The backend runs the AI Question Generator API.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies (if not done):
   ```bash
   pip install -r requirements.txt
   ```

3. Start the Server:
   ```bash
   python -m uvicorn server:app --port 8000
   ```
   *Wait for "Models loaded successfully" message. This may take 1-2 minutes on the first run as it downloads the AI models.*

4. **Verification**:
   Open a new terminal and run:
   ```bash
   cd backend
   python verify_api.py
   ```
   You should see `[SUCCESS] API responded with 200 OK`.

---

## 2. Frontend Setup (Term 2)
The frontend is a React application served by Vite.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```
   *If this command fails with "term 'npm' is not recognized", you need to install Node.js.*

3. Start the Development Server:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown (usually `http://localhost:5173`).

---

## 3. How to Test End-to-End
1. Ensure **Backend** is running on port `8000`.
2. Ensure **Frontend** is running on port `5173`.
3. In the browser (Frontend):
   - Click **"Upload PDF Chapter or Notes"**.
   - Select a sample PDF file.
   - Choose a **Difficulty** (e.g., Medium).
   - Click **"Generate Exam Draft"**.
4. **Result**: You should see a list of generated questions. You can edit them and click "Publish".
