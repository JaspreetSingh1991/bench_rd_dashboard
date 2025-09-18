# Power BI Quick Start Guide - Feedback Dashboard

## 🚀 Quick Setup (30 minutes)

### Step 1: Import Data (5 minutes)
1. Open Power BI Desktop
2. **Get Data** → **JSON** → Select your 3 JSON files:
   - `Screen_Reject.json`
   - `Tech_Reject.json` 
   - `groupoutput.json`
3. **Transform Data** → Expand nested columns
4. **Close & Apply**

### Step 2: Create Key Measures (10 minutes)
Copy these DAX measures from `PowerBI_DAX_Measures.txt`:

```DAX
// Essential measures to start with
Screen Reject Count = COUNTROWS('Screen_Reject')
Tech Reject Count = COUNTROWS('Tech_Reject')
Total Rejections = [Screen Reject Count] + [Tech Reject Count]
Total Opportunities = SUMX('GroupOutput', 'GroupOutput'[Row Count])
Rejection Rate = DIVIDE([Total Rejections], [Total Opportunities], 0) * 100
Avg Opportunities Per Candidate = DIVIDE([Total Opportunities], COUNTROWS('GroupOutput'), 0)
```

### Step 3: Create 5 Insight Cards (10 minutes)
1. Add **5 Card visuals** in a horizontal row
2. Configure each card:

| Card | Data Field | Title | Color |
|------|------------|-------|-------|
| 1 | Screen Reject Count | Screen Rejects | Red (#ef4444) |
| 2 | Tech Reject Count | Technical Rejects | Orange (#f59e0b) |
| 3 | Avg Opportunities Per Candidate | Avg Opportunities/Candidate | Green (#10b981) |
| 4 | Rejection Rate | Rejection Rate | Orange (#f59e0b) |
| 5 | Top Interviewed Role | Top Interviewed Role | Purple (#8b5cf6) |

### Step 4: Add Data Table (5 minutes)
1. Add **Table visual**
2. Add columns: `Candidate GGID`, `Candidate Name`, `Row Count`
3. Rename `Row Count` to "No of Opportunities"
4. Enable **Drillthrough** for detailed records

## 🎨 Visual Styling

### Color Scheme
- **Primary**: #3b82f6 (Blue)
- **Success**: #10b981 (Green)  
- **Warning**: #f59e0b (Orange)
- **Danger**: #ef4444 (Red)
- **Info**: #8b5cf6 (Purple)

### Card Formatting
- **Background**: White with subtle gradient
- **Border**: Left border with theme color (4px)
- **Shadow**: `0 1px 3px rgba(0,0,0,0.1)`
- **Border Radius**: 8px
- **Padding**: 16px

## 📊 Advanced Features

### Conditional Formatting
Apply to opportunity counts:
- **Green**: > 50 opportunities
- **Yellow**: 10-50 opportunities  
- **Red**: < 10 opportunities

### Interactive Filters
Add these **Slicers**:
- Date range (if available)
- Role type
- Candidate status

### Drillthrough Pages
Create separate pages for:
- Screen reject details
- Tech reject details
- Opportunity details

## 📱 Mobile Optimization

### Responsive Settings
1. **Canvas Settings** → Enable responsive design
2. **Mobile Layout** → Stack cards vertically
3. **Table** → Reduce columns on small screens

### Touch Optimization
- Increase button sizes
- Optimize font sizes
- Enable touch interactions

## 🔧 Troubleshooting

### Common Issues

**Data not loading?**
- Check JSON file structure
- Verify column names match DAX measures
- Ensure proper data types

**Measures showing errors?**
- Replace table names in DAX with your actual table names
- Check column references
- Use `DIVIDE()` instead of `/` for division

**Visuals not updating?**
- Refresh data source
- Check relationships between tables
- Verify measure syntax

### Performance Tips
- Use **Aggregations** for large datasets
- Limit visuals per page (max 15)
- Enable **DirectQuery** for real-time data

## 📈 Next Steps

1. **Publish** to Power BI Service
2. **Share** with your team
3. **Schedule** data refresh
4. **Create** mobile app access
5. **Add** more advanced analytics

## 📚 Resources

- **DAX Measures**: `PowerBI_DAX_Measures.txt`
- **Visual Config**: `PowerBI_Visual_Configuration.json`
- **Full Guide**: `PowerBI_Dashboard_Guide.md`

## 🎯 Success Metrics

Your Power BI dashboard should have:
- ✅ 5 interactive insight cards
- ✅ Data table with drillthrough
- ✅ Responsive mobile design
- ✅ Real-time data refresh
- ✅ Team sharing capabilities

---

**Need Help?** Check the full implementation guide in `PowerBI_Dashboard_Guide.md` for detailed step-by-step instructions.
