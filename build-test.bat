@echo off
echo ================================
echo Docker Build Test Script
echo ================================
echo.

echo [1/3] Building Docker image...
docker build -t wol-app:test .

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Docker build failed!
    exit /b 1
)

echo.
echo [2/3] Docker image built successfully!
echo.

echo [3/3] Image details:
docker images wol-app:test

echo.
echo ================================
echo Build completed successfully!
echo ================================
echo.
echo To run the container:
echo   docker-compose up -d
echo.
echo Or manually:
echo   docker run -d --name wol-app --network host -v %CD%\devices.json:/app/devices.json wol-app:test
echo.
