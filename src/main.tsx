import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import MqttClientContext from './contexts/MqttContext.tsx'
import TrafficLightsProvider from './contexts/SelectedTrafficLightsContext.tsx'
import CONFIG from './constants/mqttConfig.ts'
import { IClientOptions } from 'mqtt'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MqttClientContext brokerUrl={CONFIG.brokerUrl} options={CONFIG.options as IClientOptions}>
      <TrafficLightsProvider>
        <App />
      </TrafficLightsProvider>
    </MqttClientContext>
  </StrictMode>,
)
