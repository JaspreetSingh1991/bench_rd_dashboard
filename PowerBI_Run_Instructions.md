# How to Run the Power BI Dashboard

## 🚀 Quick Start (5 minutes)

### Prerequisites
- **Power BI Desktop** (free download)
- Your 3 JSON files: `Screen_Reject.json`, `Tech_Reject.json`, `groupoutput.json`

### Step 1: Download Power BI Desktop
1. Go to [powerbi.microsoft.com](https://powerbi.microsoft.com)
2. Click **"Download free"** → **"Power BI Desktop"**
3. Install the application

### Step 2: Open Power BI Desktop
1. Launch **Power BI Desktop**
2. You'll see the welcome screen

### Step 3: Import Your Data
1. Click **"Get Data"** (or **"Get Data"** button)
2. Select **"JSON"** from the list
3. Click **"Connect"**
4. Navigate to your JSON files and select all 3:
   - `Screen_Reject.json`
   - `Tech_Reject.json` 
   - `groupoutput.json`
5. Click **"Open"**

### Step 4: Transform Data
1. You'll see the **Power Query Editor**
2. For each table, expand the **"value"** column if it's nested
3. Click **"Close & Apply"** when done

### Step 5: Create the Dashboard
1. You'll be back in the main Power BI interface
2. Follow the **Quick Start Guide** (next section)

---

## 📊 Building the Dashboard (15 minutes)

### Step 1: Create DAX Measures
1. In the **Fields** panel, right-click on your data model
2. Select **"New measure"**
3. Copy and paste these essential measures:

```DAX
Screen Reject Count = COUNTROWS('Screen_Reject')

Tech Reject Count = COUNTROWS('Tech_Reject')

Total Rejections = [Screen Reject Count] + [Tech Reject Count]

Total Opportunities = SUMX('GroupOutput', 'GroupOutput'[Row Count])

Rejection Rate = DIVIDE([Total Rejections], [Total Opportunities], 0) * 100

Avg Opportunities Per Candidate = DIVIDE([Total Opportunities], COUNTROWS('GroupOutput'), 0)
```

### Step 2: Create the 5 Insight Cards
1. From the **Visualizations** panel, drag **"Card"** to the canvas
2. Repeat 5 times to create 5 cards
3. Arrange them in a horizontal row

**Configure each card:**

| Card | Data Field | Title | Color |
|------|------------|-------|-------|
| Card 1 | Screen Reject Count | Screen Rejects | Red |
| Card 2 | Tech Reject Count | Technical Rejects | Orange |
| Card 3 | Avg Opportunities Per Candidate | Avg Opportunities/Candidate | Green |
| Card 4 | Rejection Rate | Rejection Rate | Orange |
| Card 5 | (Create a text measure) | Top Interviewed Role | Purple |

### Step 3: Add Data Table
1. Drag **"Table"** from Visualizations
2. Add these fields:
   - `Candidate GGID`
   - `Candidate Name`
   - `Row Count` (rename to "No of Opportunities")

### Step 4: Style the Cards
1. Select each card
2. Go to **Format** panel
3. Set background colors:
   - Card 1: Light red
   - Card 2: Light orange
   - Card 3: Light green
   - Card 4: Light orange
   - Card 5: Light purple

---

## 🎯 Running the Dashboard

### Option 1: Run Locally (Immediate)
1. **Save** your .pbix file
2. **View** the dashboard in Power BI Desktop
3. **Interact** with cards and table
4. **Test** drillthrough and filters

### Option 2: Publish to Power BI Service (Cloud)
1. Click **"Publish"** button
2. Sign in with Microsoft account
3. Select workspace
4. Click **"Publish"**
5. Access via [app.powerbi.com](https://app.powerbi.com)

### Option 3: Share with Team
1. Publish to Power BI Service
2. Go to **"Share"** → **"Publish to web"**
3. Get embed link
4. Share with your team

---

## 🔧 Troubleshooting

### Common Issues & Solutions

**❌ "Data not loading"**
- Check JSON file format
- Ensure files are in correct location
- Verify file permissions

**❌ "Measures showing errors"**
- Check table names in DAX
- Verify column references
- Use exact field names from your data

**❌ "Visuals not updating"**
- Refresh data source
- Check relationships
- Verify measure syntax

**❌ "Cards showing blank"**
- Check if data is loaded
- Verify measure calculations
- Check field mappings

### Quick Fixes

**Refresh Data:**
1. Go to **Home** → **Refresh**
2. Or press **Ctrl + R**

**Check Data:**
1. Go to **Data** view
2. Verify your tables have data
3. Check column names

**Test Measures:**
1. Go to **Model** view
2. Click on measures
3. Check for error messages

---

## 📱 Mobile Access

### Power BI Mobile App
1. Download **Power BI** app from App Store/Google Play
2. Sign in with same Microsoft account
3. Access your published dashboard
4. View on phone/tablet

### Web Browser
1. Go to [app.powerbi.com](https://app.powerbi.com)
2. Sign in
3. Find your dashboard
4. View in browser

---

## 🚀 Advanced Features

### Real-time Updates
1. **Publish** to Power BI Service
2. Set up **scheduled refresh**
3. Data updates automatically

### Team Collaboration
1. **Share** dashboard with team
2. Set **permissions** (View/Edit)
3. Enable **comments** and **annotations**

### Mobile Optimization
1. **Responsive design** settings
2. **Touch-friendly** interactions
3. **Offline** viewing capability

---

## 📞 Need Help?

### Power BI Resources
- **Documentation**: [docs.microsoft.com/power-bi](https://docs.microsoft.com/power-bi)
- **Community**: [community.powerbi.com](https://community.powerbi.com)
- **Training**: [learn.microsoft.com/power-bi](https://learn.microsoft.com/power-bi)

### Quick Reference
- **Keyboard Shortcuts**: Ctrl + R (Refresh), Ctrl + S (Save)
- **Visual Types**: Card, Table, Slicer, Chart
- **Data Sources**: JSON, Excel, SQL, Web

---

## ✅ Success Checklist

Your Power BI dashboard is running when you have:
- [ ] 5 insight cards showing data
- [ ] Data table with candidate information
- [ ] Interactive filtering working
- [ ] Mobile view accessible
- [ ] Team sharing enabled (optional)

**🎉 Congratulations! Your Power BI dashboard is now running!**
