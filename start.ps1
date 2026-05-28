# Neuro Code Editor - Quick Start Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Neuro Code Editor - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting Neuro Code Editor..." -ForegroundColor Cyan
Write-Host ""

# Start backend in a new window
Write-Host "Starting FastAPI backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn api:app --host 127.0.0.1 --port 8000"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend and Electron
Write-Host "Starting Electron application..." -ForegroundColor Yellow
npm start

Write-Host ""
Write-Host "Application closed." -ForegroundColor Cyan
