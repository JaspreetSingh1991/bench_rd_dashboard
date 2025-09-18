#!/bin/bash

echo "========================================"
echo "   Power BI Dashboard Setup Helper"
echo "========================================"
echo

echo "Checking for JSON files..."
if [ ! -f "Screen_Reject.json" ]; then
    echo "ERROR: Screen_Reject.json not found!"
    echo "Please ensure all 3 JSON files are in this directory:"
    echo "- Screen_Reject.json"
    echo "- Tech_Reject.json"
    echo "- groupoutput.json"
    echo
    exit 1
fi

if [ ! -f "Tech_Reject.json" ]; then
    echo "ERROR: Tech_Reject.json not found!"
    exit 1
fi

if [ ! -f "groupoutput.json" ]; then
    echo "ERROR: groupoutput.json not found!"
    exit 1
fi

echo "All JSON files found!"
echo

echo "========================================"
echo "   Next Steps:"
echo "========================================"
echo "1. Download Power BI Desktop from:"
echo "   https://powerbi.microsoft.com"
echo "2. Install Power BI Desktop"
echo "3. Open Power BI Desktop"
echo "4. Click 'Get Data' and select 'JSON'"
echo "5. Import your 3 JSON files"
echo "6. Follow the PowerBI_Run_Instructions.md guide"
echo "7. Copy the DAX measures from PowerBI_DAX_Measures.txt"
echo
echo "For detailed instructions, open: PowerBI_Run_Instructions.md"
echo

# Try to open the instructions file
if command -v open >/dev/null 2>&1; then
    echo "Opening instructions file..."
    open PowerBI_Run_Instructions.md
elif command -v xdg-open >/dev/null 2>&1; then
    echo "Opening instructions file..."
    xdg-open PowerBI_Run_Instructions.md
else
    echo "Please open PowerBI_Run_Instructions.md manually"
fi
