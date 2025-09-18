@echo off
echo ========================================
echo    Power BI Dashboard Setup Helper
echo ========================================
echo.

echo Checking for Power BI Desktop...
where pbidesktop >nul 2>nul
if %errorlevel% neq 0 (
    echo Power BI Desktop not found in PATH.
    echo Please install Power BI Desktop first:
    echo 1. Go to https://powerbi.microsoft.com
    echo 2. Click "Download free" 
    echo 3. Install Power BI Desktop
    echo.
    pause
    exit /b 1
)

echo Power BI Desktop found!
echo.

echo Checking for JSON files...
if not exist "Screen_Reject.json" (
    echo ERROR: Screen_Reject.json not found!
    echo Please ensure all 3 JSON files are in this directory:
    echo - Screen_Reject.json
    echo - Tech_Reject.json  
    echo - groupoutput.json
    echo.
    pause
    exit /b 1
)

if not exist "Tech_Reject.json" (
    echo ERROR: Tech_Reject.json not found!
    pause
    exit /b 1
)

if not exist "groupoutput.json" (
    echo ERROR: groupoutput.json not found!
    pause
    exit /b 1
)

echo All JSON files found!
echo.

echo Opening Power BI Desktop...
start "" "C:\Program Files\Microsoft Power BI Desktop\bin\PBIDesktop.exe"

echo.
echo ========================================
echo    Next Steps:
echo ========================================
echo 1. In Power BI Desktop, click "Get Data"
echo 2. Select "JSON" and import your 3 files
echo 3. Follow the PowerBI_Run_Instructions.md guide
echo 4. Copy the DAX measures from PowerBI_DAX_Measures.txt
echo.
echo For detailed instructions, open: PowerBI_Run_Instructions.md
echo.

pause
