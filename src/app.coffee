app = require 'app'
browser = require 'browser-window'
fs = require 'fs'
ipc = require 'ipc'

mainWindow = null

app.on 'ready' () ->
  mainWindow = new browser({
    width: 800
    height: 600
    center: true
    title: 'Aperture'
  })

  mainWindow.setMenu(null)
  mainWindow.openDevTools()
  mainWindow.loadUrl('file://' + __dirname + '/editor/index.html')

  mainWindow.on 'closed' () ->
    mainWindow = null
