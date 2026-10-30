@echo off
echo ==============================================================================
echo MRF RESEARCH RETREAT 2026 - CINEMATIC DIGITAL INAUGURATION CEREMONY
echo Maharaja Institute of Technology, Mysore
echo Target Display: 1920x1080 LED Screen
echo Operator Hotkey: CTRL + SHIFT + P (or Spacebar for Emergency Trigger)
echo ==============================================================================
echo Starting Production Server...
start /min cmd /c "npm run preview -- --port 3000 --host"
timeout /t 2 >nul

echo Launching Fullscreen Kiosk Mode...
start msedge --start-fullscreen http://localhost:3000 || start chrome --start-fullscreen http://localhost:3000 || start http://localhost:3000
echo Ceremony sequence active. Press Ctrl+C in this window to stop.
