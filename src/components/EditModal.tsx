import { useContext, useMemo, useState } from "react";
import { TrafficLightsContext } from "../contexts/SelectedTrafficLightsContext";

const arrAAndB = ["A", "B"];

export default function EditModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const trafficLightContext = useContext(TrafficLightsContext);
    const [greenTimeA, setGreenTimeA] = useState(0); // Tempo no verde para o Semáforo A
    const [yellowTimeA, setYellowTimeA] = useState(0); // Tempo no amarelo para o Semáforo A
    const [greenTimeB, setGreenTimeB] = useState(0); // Tempo no verde para o Semáforo B
    const [yellowTimeB, setYellowTimeB] = useState(0); // Tempo no amarelo para o Semáforo B

    // Sensor configurations
    const [hasCarSensor, setHasCarSensor] = useState(false);
    const [carSensorTime, setCarSensorTime] = useState(0); // Extra time due to car sensor
    const [hasUltrasonicSensor, setHasUltrasonicSensor] = useState(false);
    const [ultrasonicSensorTime, setUltrasonicSensorTime] = useState(0); // Extra time due to ultrasonic sensor

    const crossroadActive = useMemo(() => {
        if (!trafficLightContext?.crossroads.length) {
            return [];
        }
        for (let i = 0; i < trafficLightContext?.crossroads?.length; i++) {
            if (trafficLightContext?.crossroads[i].find((light) => light.id === trafficLightContext?.selectedTrafficLight?.id)) {
                return [trafficLightContext?.crossroads[i], i];
            }
        }
        return [];
    }, [trafficLightContext?.selectedTrafficLight]);

    const handleSave = () => {
        // Save configurations
        if (crossroadActive.length === 0 || typeof crossroadActive[1] !== "number") {
            return;
        }
        trafficLightContext?.addConfigurationToCrossroad(crossroadActive[1], [{
            green: greenTimeA,
            yellow: yellowTimeA,
            red: greenTimeB,
        }, {
            green: greenTimeB,
            yellow: yellowTimeB,
            red: greenTimeA,
        }]);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className='absolute w-full h-full z-50 backdrop-blur-md bg-gray-700 bg-opacity-40 flex items-center justify-center'>
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full space-y-4 max-h-[90%] overflow-y-scroll">
                <h1 className="text-xl font-semibold mb-4">
                    Editar configurações do cruzamento
                </h1>

                <div>
                    {crossroadActive.length && typeof crossroadActive[0] !== "number" && crossroadActive[0].map((light, index) => (
                            <div key={light.id} className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold">Semáforo {arrAAndB[index]} ID: {light.id}</h3>
                            </div>
                        ))
                    }
                </div>

                {/* Configurações do Semáforo A */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Configurações do Semáforo A</h3>
                    <label className="block">
                        <span className="text-gray-700 flex items-center gap-4">Tempo no vermelho (segundos) <div className="w-4 h-4 rounded-full bg-red-600"/></span>
                        <input
                            type="number"
                            value={greenTimeB}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                        />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 flex items-center gap-4">Tempo no amarelo (segundos) <div className="w-4 h-4 rounded-full bg-yellow-500"/></span>
                        <input
                            type="number"
                            value={yellowTimeA}
                            onChange={(e) => setYellowTimeA(Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </label>
                    
                    <label className="block">
                        <span className="text-gray-700 flex items-center gap-4">Tempo no verde (segundos) <div className="w-4 h-4 rounded-full bg-green-500"/></span>
                        <input
                            type="number"
                            value={greenTimeA}
                            onChange={(e) => setGreenTimeA(Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </label>
                </div>

                {/* Configurações do Semáforo B */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Configurações do Semáforo B</h3>
                    <label className="block">
                        <span className="text-gray-700 flex items-center gap-4">Tempo no vermelho (segundos) <div className="w-4 h-4 rounded-full bg-red-600"/></span>
                        <input
                            type="number"
                            value={greenTimeA}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                        />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 flex items-center gap-4">Tempo no amarelo (segundos) <div className="w-4 h-4 rounded-full bg-yellow-500"/></span>
                        <input
                            type="number"
                            value={yellowTimeB}
                            onChange={(e) => setYellowTimeB(Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 flex items-center gap-4">Tempo no verde (segundos) <div className="w-4 h-4 rounded-full bg-green-500"/></span>
                        <input
                            type="number"
                            value={greenTimeB}
                            onChange={(e) => setGreenTimeB(Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </label>
                </div>

                {/* Configurações dos Sensores */}
                <div className="space-y-3 mt-6">
                    <h3 className="text-lg font-semibold">Configurações de Sensores</h3>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={hasCarSensor}
                            onChange={(e) => setHasCarSensor(e.target.checked)}
                        />
                        <span className="text-gray-700">Ativar Sensor de Carro</span>
                    </label>
                    {hasCarSensor && (
                        <label className="block">
                            <span className="text-gray-700">Tempo extra com sensor de carro ativo (segundos)</span>
                            <input
                                type="number"
                                value={carSensorTime}
                                onChange={(e) => setCarSensorTime(Number(e.target.value))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </label>
                    )}

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={hasUltrasonicSensor}
                            onChange={(e) => setHasUltrasonicSensor(e.target.checked)}
                        />
                        <span className="text-gray-700">Ativar Sensor Ultrassônico</span>
                    </label>
                    {hasUltrasonicSensor && (
                        <label className="block">
                            <span className="text-gray-700">Tempo extra com sensor ultrassônico ativo (segundos)</span>
                            <input
                                type="number"
                                value={ultrasonicSensorTime}
                                onChange={(e) => setUltrasonicSensorTime(Number(e.target.value))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </label>
                    )}
                </div>

                {/* Botões de ação */}
                <div className="flex justify-end space-x-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}
