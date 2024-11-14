import { useContext, useMemo, useState } from 'react'
import './App.css'
import { MqttContext } from './contexts/MqttContext'
import Sidebar from './components/Sidebar'
import { TrafficLightsContext } from './contexts/SelectedTrafficLightsContext'
import TrafficLight from './components/TrafficLight'
import EditModal from './components/EditModal'

function App() {
  const mqttContext = useContext(MqttContext)
  const trafficLightsContext = useContext(TrafficLightsContext)

  const actualCrossroadIndex = useMemo(() => {
    return trafficLightsContext?.crossroads.findIndex((crossroad) => crossroad.find((light) => light.id === trafficLightsContext?.selectedTrafficLight?.id));
  }, [trafficLightsContext?.crossroads, trafficLightsContext?.selectedTrafficLight]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const trafficLightId = e.dataTransfer.getData("trafficLightId");  // Retrieve ID from data transfer
    console.log("Dropped traffic light with ID: ", trafficLightId);
    setIsDragging(false);
    const trafficLightSelected = trafficLightsContext?.selectedTrafficLights.find((light) => light.id === trafficLightId);
    if (trafficLightSelected) {
      console.log("Traffic light already selected");
      return;
    }

    const distancesAvailableTraffics = trafficLightsContext?.selectedTrafficLights.filter((light) => {
      const distance = Math.sqrt(Math.pow(light.x - e.clientX, 2) + Math.pow(light.y - e.clientY, 2));
      return (light.id !== trafficLightId && distance < 128);
    });


    if (distancesAvailableTraffics?.length === 0) {
      trafficLightsContext?.selectTrafficLight({ x: e.clientX, y: e.clientY, id: trafficLightId });
      trafficLightsContext?.addTrafficLightToNewCrossroad({ x: e.clientX, y: e.clientY, id: trafficLightId });
      return;
    }
    
    const closestTrafficLight = distancesAvailableTraffics?.reduce((prev, current) => {
      const prevDistance = Math.sqrt(Math.pow(prev.x - e.clientX, 2) + Math.pow(prev.y - e.clientY, 2));
      const currentDistance = Math.sqrt(Math.pow(current.x - e.clientX, 2) + Math.pow(current.y - e.clientY, 2));
      return prevDistance < currentDistance ? prev : current;
    });

    // Veryfing if the closest traffic light has a crossroad
    const crossroadIndex = trafficLightsContext?.crossroads.findIndex((crossroad) => crossroad.find((light) => light.id === closestTrafficLight?.id));
    console.log("Crossroad index: ", crossroadIndex);
    if (crossroadIndex !== undefined && crossroadIndex !== -1 && (trafficLightsContext?.crossroads[crossroadIndex]?.length ?? 0) < 2) {
      trafficLightsContext?.addTrafficLightToExistingCrossroad(crossroadIndex, { x: e.clientX, y: e.clientY, id: trafficLightId });
      trafficLightsContext?.selectTrafficLight({ x: e.clientX, y: e.clientY, id: trafficLightId });
    }

    console.log("Closest traffic light: ", closestTrafficLight);
    console.log("Crossroads: ", trafficLightsContext?.crossroads);
    
  };
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();  // Allow drop
    setMousePosition({ x: e.clientX, y: e.clientY });
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  return (
    <div className='flex flex-row w-full h-full'>
        { isDragging && (
          <div
            className="flex flex-col gap-2 bg-black p-2 rounded-sm fixed scale-50"
            style={{
                top: mousePosition.y, // Ajusta a posição para 10px abaixo do cursor
                left: mousePosition.x,// Centraliza o elemento em relação ao cursor
            }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        )}
      <EditModal isOpen={isEditing} onClose={() => setIsEditing(false)}/>
      <Sidebar />
      <div className='w-full h-full flex flex-col'>
        <div className="header flex flex-row justify-between p-8 w-full items-center h-fit">
          <h1 className='text-lg uppercase font-bold'>Controle de semáforo</h1>
          <h3 className='font-bold'>Status: <span className={`${mqttContext?.status === "connected" ? "text-lime-800" : "text-red-800"} font-medium uppercase`}>{mqttContext?.status}</span></h3>
        </div>
        <div className="options flex gap-2">
          <button className='bg-transparent text-blue-500 p-2 rounded-md flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed' disabled={!trafficLightsContext?.selectedTrafficLight} 
            onClick={() => setIsEditing(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 12V7H4a2 2 0 00-2 2v7a2 2 0 002 2h7a2 2 0 002-2v-1H8a3 3 0 01-3-3z" />
            </svg>
            Editar
          </button>
          <button className='bg-transparent text-red-500 p-2 rounded-md flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed' disabled={!trafficLightsContext?.selectedTrafficLight}
            onClick={() => {
              if (trafficLightsContext?.selectedTrafficLight) {
                trafficLightsContext?.deleteTrafficLight(trafficLightsContext?.selectedTrafficLight.id);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h1v10a2 2 0 002 2h8a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 4a1 1 0 112 0v8a1 1 0 11-2 0V6z" clipRule="evenodd" />
            </svg>
            Remover
          </button>
          <button className='bg-transparent text-green-500 p-2 rounded-md flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed self-end' disabled={(() => {
            if (actualCrossroadIndex === undefined || actualCrossroadIndex === -1) return true;
            if ((trafficLightsContext?.crossroads[actualCrossroadIndex]?.length ?? 0) !== 2) return true;
            return false;
          })()}
            onClick={() => {
              if (actualCrossroadIndex !== undefined && actualCrossroadIndex !== -1 && (trafficLightsContext?.crossroads[actualCrossroadIndex]?.length ?? 0) === 2 && trafficLightsContext?.crossroads[actualCrossroadIndex]?.every((light) => !!light.configuration) && !trafficLightsContext?.isLightCycleRunning(actualCrossroadIndex)) {
                trafficLightsContext?.startTrafficLightCycle(actualCrossroadIndex);
                return;
              }
              if (actualCrossroadIndex !== undefined && trafficLightsContext?.isLightCycleRunning(actualCrossroadIndex)) {
                trafficLightsContext?.stopTrafficLightCycle(actualCrossroadIndex);
                return;
              }
            }}
          >
            { (() => {
              if (actualCrossroadIndex === undefined || actualCrossroadIndex === -1) return "Selecionar cruzamento";
              if ((trafficLightsContext?.crossroads[actualCrossroadIndex]?.length ?? 0) !== 2) return "Selecionar cruzamento";
              if (trafficLightsContext?.isLightCycleRunning(actualCrossroadIndex)) return "Parar ciclo";
              return "Iniciar ciclo";
            })() }
          </button>
        </div>
        <div 
          className="lights-dragabble border-2 mx-2 h-full" 
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          >
            { trafficLightsContext?.selectedTrafficLights.map((light) => {
              const activeFromCrossroad = trafficLightsContext?.crossroads.find((crossroad) => crossroad.find((l) => l.id === light.id));
              const actualTrafficLight = activeFromCrossroad?.find((l) => l.id === light.id);
              return (
                <TrafficLight key={light.id} light={light} isDragging={isDragging && !!activeFromCrossroad && activeFromCrossroad?.length < 2} currentState={actualTrafficLight?.currentState}/>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default App
