const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Always use development URL for now since we're in development
  const isDev = process.env.NODE_ENV === 'development' || !fs.existsSync(path.join(__dirname, '../build/index.html'));
  
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  
  // Auto-load Excel file when window is ready
  mainWindow.webContents.on('did-finish-load', async () => {
    try {
      const documentsPath = path.join(app.getPath('home'), 'Documents');
      const filePath = path.join(documentsPath, 'Bench_RD Tracker_update.xlsx');
      
      if (fs.existsSync(filePath)) {
        console.log('Auto-loading Excel file from Documents folder...');
        mainWindow.webContents.send('auto-load-excel-file');
      } else {
        console.log('Excel file not found in Documents folder, skipping auto-load');
      }
    } catch (error) {
      console.error('Error checking for auto-load file:', error);
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for file operations
ipcMain.handle('load-excel-file', async () => {
  try {
    const documentsPath = path.join(app.getPath('home'), 'Documents');
    const filePath = path.join(documentsPath, 'Bench_RD Tracker_update.xlsx');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Excel file not found in Documents folder');
    }
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = 'RD_BENCH_Tracker';
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found in the Excel file`);
    }
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      throw new Error('Excel file is empty or has no data rows');
    }
    
    // Convert to array of objects with headers
    const headers = jsonData[0];
    const rows = jsonData.slice(1);
    
    const processedData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    return processedData;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('select-excel-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
      ]
    });
    
    if (result.canceled) {
      return null;
    }
    
    const filePath = result.filePaths[0];
    const workbook = XLSX.readFile(filePath);
    const sheetName = 'RD_BENCH_Tracker';
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found in the Excel file`);
    }
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      throw new Error('Excel file is empty or has no data rows');
    }
    
    // Convert to array of objects with headers
    const headers = jsonData[0];
    const rows = jsonData.slice(1);
    
    const processedData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    return processedData;
  } catch (error) {
    throw error;
  }
});
