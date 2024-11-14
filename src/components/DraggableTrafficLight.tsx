// DraggableTrafficLight.tsx
import { useState, CSSProperties } from "react";

interface DraggableTrafficLightProps {
    id: string;
    name: string;
    description: string;
    style?: CSSProperties;  // Adiciona style como opcional
}

export default function DraggableTrafficLight({
    id,
    name,
    description,
    style,
}: DraggableTrafficLightProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("trafficLightId", id);
        e.dataTransfer.dropEffect = "move";
        e.dataTransfer.effectAllowed = "move";

        const ghost = document.createElement("div");
        ghost.style.width = "0px";
        ghost.style.height = "0px";
        e.dataTransfer.setDragImage(ghost, 0, 0);

        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={style}  // Aplica o estilo passado como prop
            className={`traffic-light bg-white p-4 m-2 border-2 border-gray-200 rounded-lg shadow-md transition-transform duration-300 ease-in-out ${
                isDragging ? "scale-105 rotate-3 opacity-75 cursor-move" : "scale-100 rotate-0 opacity-100"
            }`}
        >
            <h1 className="text-sm font-bold">{name}</h1>
            <p className="text-xs text-gray-600">{description}</p>
            <div className="flex flex-col gap-2 bg-black mt-2 w-fit p-2 rounded-sm">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
        </div>
    );
}
