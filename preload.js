const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('appInfo', {
  name: 'WhatsApp Chat Viewer TR'
});
