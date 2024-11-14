import { useContext } from "react";
import { TrafficLightsContext } from "../contexts/SelectedTrafficLightsContext";

export default function TrafficLight({
    light,
    isDragging,
    currentState,
}: {
    light: { x: number; y: number, id: string };
    isDragging: boolean;
    currentState: "green" | "yellow" | "red" | undefined;
}){
    const trafficLightContext = useContext(TrafficLightsContext);

    return (
        <div
              className={`flex flex-col gap-2 bg-black p-2 rounded-sm fixed scale-75 ${trafficLightContext?.selectedTrafficLight?.id === light.id ? 'border-2 border-blue-500' : ''}`}
              style={{
                  top: light.y, // Ajusta a posição para 10px abaixo do cursor
                  left: light.x,// Centraliza o elemento em relação ao cursor
              }}
              onClick={() => {
                if (trafficLightContext?.selectedTrafficLight?.id === light.id) {
                    trafficLightContext?.setSelectedTrafficLight(null);
                } else {
                    trafficLightContext?.setSelectedTrafficLight({ x: light.x, y: light.y, id: light.id });
                }
              }}
            >
              { isDragging && (
                <div className='w-64 h-64 rounded-full absolute bg-blue-100 -translate-x-1/2 -translate-y-1/2 left-4 top-5 opacity-50'></div>
              )}
              <div className={`w-3 h-3 rounded-full ${currentState === 'red' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${currentState === 'yellow' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${currentState === 'green' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
    )
}