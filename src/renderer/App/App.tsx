import * as React from 'react';
import * as reactLogo from './images/react-icon.svg';
import * as tsLogo from './images/typescript-icon.svg';
import * as electronLogo from './images/electron-icon.svg';
import './App.css';
import { ipcRenderer } from "electron"

// what i want to do
// when i click button the whole app (including the go server should die)


// note
// can kill only kill go process properly from frontend
// this requires to listen for event from main process

// Main ---(kill-app)---> Renderer 
//  ---> Websocket ---> Go Server
//  ---> Renderer (backend-stopped)
//  ---> Main (app.quit)

export const App = (): JSX.Element => {
  const ws: WebSocket = new WebSocket('ws://localhost:8080/kill')
  // sends message to main confirming connection with go server
  ws.onopen = (event) => {
    console.log('connected to go server')
    ipcRenderer.send('render-go', 'connected to go server-[frontend]')
  }

  // recieves message from go sever saying the server has been killed
  ws.onclose = () => {
    ipcRenderer.send('backend-killed', 'the go server has been killed')
  }


  // recieves message from main to kill app
  ipcRenderer.on('kill-app', () => {
    ws.send('die') // tells go server to die
  })

  const killApp = () => {
    ipcRenderer.send('render-go', 'killing backend')
    ipcRenderer.send('kill-backend')
  }

  return (
    <div className='App'>
      <div className='container'>
        <img
          src={reactLogo.default}
          className='App-logo'
          alt='react-logo'
          id='react-logo'
        />
        <a
          className='App-link'
          href='https://reactjs.org'
          target='_blank'
          rel='noopener noreferrer'
          id='react-link'
        >
          Learn React
        </a>
      </div>
      <div className='container'>
        <img
          src={tsLogo.default}
          className='App-logo'
          alt='typescript-logo'
          id='typescript-logo'
        />
        <a
          className='App-link'
          href='https://www.typescriptlang.org/'
          target='_blank'
          rel='noopener noreferrer'
          id='typescript-link'
        >
          Learn TypeScript
        </a>
      </div>
      <div className='container'>
        <img
          src={electronLogo.default}
          className='App-logo'
          alt='electron-logo'
          id='electron-logo'
        />
        <a
          className='App-link'
          href='https://www.electronjs.org/'
          target='_blank'
          rel='noopener noreferrer'
          id='electron-link'
        >
          Learn Electron
        </a>
      </div>
      <button onClick={() => killApp()}>
        Kill app
      </button>
    </div>
  );
};

export default App;
