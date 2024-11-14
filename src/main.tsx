import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import MqttClientContext from './contexts/MqttContext.tsx'
import TrafficLightsProvider from './contexts/SelectedTrafficLightsContext.tsx'
import MQTT_CONFIG from './config/mqttConfig.ts'
import { IClientOptions } from 'mqtt'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MqttClientContext brokerUrl={MQTT_CONFIG.brokerUrl} options={MQTT_CONFIG.options as IClientOptions}>
      <TrafficLightsProvider>
        <App />
      </TrafficLightsProvider>
    </MqttClientContext>
  </StrictMode>,
)
