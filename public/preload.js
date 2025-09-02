const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadExcelFile: () => ipcRenderer.invoke('load-excel-file'),
  selectExcelFile: () => ipcRenderer.invoke('select-excel-file'),
  onAutoLoadExcel: (callback) => ipcRenderer.on('auto-load-excel-file', callback)
});
