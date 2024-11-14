// Sidebar.tsx
import { useContext, useState } from "react";
import DraggableTrafficLight from "./DraggableTrafficLight";
import { TrafficLightsContext } from "../contexts/SelectedTrafficLightsContext";

export default function Sidebar() {
    const [expanded, setExpanded] = useState<boolean>(true);
    const trafficLightContext = useContext(TrafficLightsContext);

    return (
        <div
            className={`flexibleSidebar bg-white border-r-2 h-full ${
                expanded ? "w-96" : "w-0"
            } transition-all duration-100 relative`}
        >
            <button
                onClick={() => setExpanded(!expanded)}
                className="absolute -right-10 top-1/2 p-2 text-black -translate-y-1/2 shadow-2xl bg-slate-200 rounded-lg drop-shadow-lg hover:bg-slate-300"
            >
                {expanded ? "🡸" : "🡺"}
            </button>
            {expanded && (
                <div className="p-4 h-full">
                    <h1 className="text-xl font-bold">Semáforos reconhecidos</h1>
                    <p className="text-sm text-gray-600">Controle de semáforo via MQTT</p>
                    <div className="items flex flex-wrap">
                        { trafficLightContext?.foundTrafficLightsIds.map((id, index) => (
                            <DraggableTrafficLight key={id} id={id} name={`Semáforo ${index + 1}`} description={id} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
