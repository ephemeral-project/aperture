var app = require('app'),
    BrowserWindow = require('browser-window'),
    fs = require('fs'),
    ipc = require('ipc')

var mainWindow = null

ipc.on('load-source', function(event, arg) {
  fs.readFile('package.json', 'utf8', function(err, data) {
    event.sender.send('source-loaded', data);
  })
})

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    title: 'Ephemeral'
  })

  mainWindow.setMenu(null)
  mainWindow.openDevTools()
  mainWindow.loadUrl('file://' + __dirname + '/editor/index.html')

  mainWindow.on('closed', function() {
    mainWindow = null
  })
})
