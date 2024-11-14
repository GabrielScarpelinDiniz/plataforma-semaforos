import { createContext, useContext, useEffect, useRef, useState } from "react";
import { MqttContext } from "./MqttContext";

interface TrafficLight {
    id: string;
    x: number;
    y: number;
}

interface CrossroadTrafficLight extends TrafficLight {
    configuration?: {
        green: number;
        yellow: number;
        red: number;
    };
    currentState?: "green" | "yellow" | "red"; // Estado atual do semáforo
}


interface TrafficLightsContextType {
    selectedTrafficLights: TrafficLight[];
    selectTrafficLight: (light: TrafficLight) => void;
    deselectTrafficLight: (id: string) => void;
    selectedTrafficLight: TrafficLight | null;
    setSelectedTrafficLight: (light: TrafficLight | null) => void;
    crossroads: CrossroadTrafficLight[][];
    addTrafficLightToExistingCrossroad: (crossroadIndex: number, light: TrafficLight) => void;
    addTrafficLightToNewCrossroad: (light: TrafficLight) => void;
    addConfigurationToCrossroad: (crossroadIndex: number, configuration: { green: number; yellow: number; red: number }[]) => void;
    stopTrafficLightCycle: (crossroadIndex: number) => void;
    isLightCycleRunning: (crossroadIndex: number) => boolean;
    startTrafficLightCycle: (crossroadIndex: number) => void;
    deleteTrafficLight: (id: string) => void;
    foundTrafficLightsIds: string[];
}

const TrafficLightsContext = createContext<TrafficLightsContextType | null>(null);

export { TrafficLightsContext };

export default function TrafficLightsProvider({ children }: { children: React.ReactNode }) {
    const [selectedTrafficLights, setSelectedTrafficLights] = useState<TrafficLight[]>([]);
    const [selectedTrafficLight, setSelectedTrafficLight] = useState<TrafficLight | null>(null);
    const [crossroads, setCrossroads] = useState<CrossroadTrafficLight[][]>([]);
    const crossroadsRef = useRef(crossroads);  // Ref para manter o estado atualizado de crossroads
    const [foundTrafficLightsIds, setFoundTrafficLightsIds] = useState<string[]>([]);
    const foundTrafficLightsIdsRef = useRef(foundTrafficLightsIds);  // Ref para foundTrafficLightsIds
    const [isSubscribedAtNewTrafficLightsTopic, setIsSubscribedAtNewTrafficLightsTopic] = useState(false);
    const crossroadsTimeout = useRef<{ [key: number]: NodeJS.Timeout }>({});
    const [pendingConfigUpdate, setPendingConfigUpdate] = useState<number | null>(null);  // Rastreamento de atualizações pendentes

    const mqttContext = useContext(MqttContext);

    useEffect(() => {
        foundTrafficLightsIdsRef.current = foundTrafficLightsIds;
    }, [foundTrafficLightsIds]);

    useEffect(() => {
        console.log("Updating crossroads ref");
        console.log("Crossroads: ", crossroads);
        crossroadsRef.current = crossroads;
    }, [crossroads]);

    const selectTrafficLight = (light: TrafficLight) => {
        if (!selectedTrafficLights.find((l) => l.id === light.id)) {
            setSelectedTrafficLights([...selectedTrafficLights, light]);
        }
    };

    const deselectTrafficLight = (id: string) => {
        setSelectedTrafficLights(selectedTrafficLights.filter((light) => light.id !== id));
    };

    const deleteTrafficLight = (id: string) => {
        setSelectedTrafficLights(selectedTrafficLights.filter((light) => light.id !== id));
        stopTrafficLightCycle(crossroads.findIndex((crossroad) => crossroad.find((light) => light.id === id)));
        setCrossroads((prevCrossroads) => prevCrossroads.map((crossroad) => crossroad.filter((light) => light.id !== id)));
    };

    const addTrafficLightToExistingCrossroad = (crossroadIndex: number, light: TrafficLight) => {
        setCrossroads((prevCrossroads) => {
            const newCrossroads = [...prevCrossroads];
            if (newCrossroads[crossroadIndex].length < 2) {
                newCrossroads[crossroadIndex] = [...newCrossroads[crossroadIndex], { ...light, currentState: "red" }];
            }
            return newCrossroads;
        });
    };

    const addTrafficLightToNewCrossroad = (light: TrafficLight) => {
        setCrossroads((prevCrossroads) => [...prevCrossroads, [{ ...light, currentState: "red" }]]);
    };

    // Função para aplicar a configuração ao cruzamento e iniciar o ciclo
    const addConfigurationToCrossroad = (crossroadIndex: number, configurations: { green: number; yellow: number; red: number }[]) => {
        setCrossroads((prevCrossroads) => {
            const newCrossroads = [...prevCrossroads];
            if (newCrossroads[crossroadIndex]) {
                newCrossroads[crossroadIndex] = newCrossroads[crossroadIndex].map((light, idx) => ({
                    ...light,
                    configuration: configurations[idx],
                }));
                setPendingConfigUpdate(crossroadIndex);
            }
            return newCrossroads;
        });
    };

    useEffect(() => {
        if (pendingConfigUpdate !== null) {
            // Inicia o ciclo após confirmação da atualização
            startTrafficLightCycle(pendingConfigUpdate);
            setPendingConfigUpdate(null);  // Reseta o estado pendente
        }
    }, [pendingConfigUpdate]);

    const startTrafficLightCycle = (crossroadIndex: number) => {
        const crossroad = crossroadsRef.current[crossroadIndex];
        if (!crossroad || crossroad.length !== 2) return; // Garante que o cruzamento tenha exatamente dois semáforos
    
        // Limpa qualquer intervalo ativo anterior para o cruzamento específico
        if (crossroadsTimeout.current[crossroadIndex]) clearInterval(crossroadsTimeout.current[crossroadIndex]);
    
        const lightA = crossroad[0];
        const lightB = crossroad[1];
        
        // Inicia o ciclo de mudança de estados
        lightA.currentState = "green";
        lightB.currentState = "red";
    
        console.log("Starting traffic light cycle for crossroad: ", crossroad);
        console.log("Light A: ", lightA);
        console.log("Light B: ", lightB);
    
        const changeLightState = () => {
            if (lightA.currentState === "green" && lightB.currentState === "red") {
                // Transição de lightA para yellow, mantendo lightB em red
                lightA.currentState = "yellow";
                lightB.currentState = "red";
                crossroadsTimeout.current[crossroadIndex] = setTimeout(changeLightState, (lightA.configuration?.yellow ?? 5) * 1000);
        
            } else if (lightA.currentState === "yellow" && lightB.currentState === "red") {
                // Transição de lightA para red, permitindo lightB em green
                lightA.currentState = "red";
                lightB.currentState = "green";
                crossroadsTimeout.current[crossroadIndex] = setTimeout(changeLightState, (lightB.configuration?.red ?? 3) * 1000);
        
            } else if (lightA.currentState === "red" && lightB.currentState === "green") {
                // Transição de lightB para yellow, mantendo lightA em red
                lightB.currentState = "yellow";
                crossroadsTimeout.current[crossroadIndex] = setTimeout(changeLightState, (lightB.configuration?.yellow ?? 5) * 1000);
        
            } else if (lightA.currentState === "red" && lightB.currentState === "yellow") {
                // Transição de lightB para red, permitindo lightA em green
                lightA.currentState = "green";
                lightB.currentState = "red";
                crossroadsTimeout.current[crossroadIndex] = setTimeout(changeLightState, (lightA.configuration?.green ?? 3) * 1000);
            }

            if (lightA.currentState && lightB.currentState) {
                mqttContext?.publish("traffic-light/state/" + lightA.id, lightA.currentState);
                mqttContext?.publish("traffic-light/state/" + lightB.id, lightB.currentState);
                setCrossroads((prevCrossroads) => {
                    const newCrossroads = [...prevCrossroads];
                    newCrossroads[crossroadIndex] = crossroad; // Usa a referência original do crossroad
                    return newCrossroads;
                });
            }
        };

        const handleLdrMessage = (topic: string, message: string) => {
            const lightId = topic.split("/")[1];
            // getting ldr state
            const { ldrState } = JSON.parse(message.toString());
            console.log("LDR state: ", ldrState);
            if (ldrState === "HIGH") {
                if (lightA.id === lightId && lightA.currentState === "green") {
                    lightA.currentState = "yellow";
                    lightB.currentState = "red";
                    clearTimeout(crossroadsTimeout.current[crossroadIndex]);
                    crossroadsTimeout.current[crossroadIndex] = setTimeout(changeLightState, 2000);
                } else if (lightB.id === lightId && lightB.currentState === "green") {
                    lightB.currentState = "yellow";
                    lightA.currentState = "red";
                    clearTimeout(crossroadsTimeout.current[crossroadIndex]);
                    crossroadsTimeout.current[crossroadIndex] = setTimeout(changeLightState, 2000);
                }

                setCrossroads((prevCrossroads) => {
                    const newCrossroads = [...prevCrossroads];
                    newCrossroads[crossroadIndex] = crossroad;
                    return newCrossroads;
                });

                if (lightA.currentState && lightB.currentState) {
                    mqttContext?.publish("traffic-light/state/" + lightA.id, lightA.currentState);
                    mqttContext?.publish("traffic-light/state/" + lightB.id, lightB.currentState);
                }
            }

        }

        const handleWalkerButtonMessage = (topic: string, message: string) => {
            const lightId = topic.split("/")[1];
            const { buttonState } = JSON.parse(message.toString());
            console.log("Button state: ", buttonState);
            if (buttonState === "HIGH") {
                if (lightA.id === lightId && lightA.currentState === "green") {
                    lightA.currentState = "yellow";
                    lightB.currentState = "red";
                    clearTimeout(crossroadsTimeout.current[crossroadIndex]);
                    crossroadsTimeout.current[crossroadIndex] = setTimeout(changeLightState, 2000);
                } else if (lightB.id === lightId && lightB.currentState === "green") {
                    lightB.currentState = "yellow";
                    lightA.currentState = "red";
                    clearTimeout(crossroadsTimeout.current[crossroadIndex]);
                    crossroadsTimeout.current[crossroadIndex] = setTimeout(changeLightState, 2000);
                }

                setCrossroads((prevCrossroads) => {
                    const newCrossroads = [...prevCrossroads];
                    newCrossroads[crossroadIndex] = crossroad;
                    return newCrossroads;
                });

                if (lightA.currentState && lightB.currentState) {
                    mqttContext?.publish("traffic-light/state/" + lightA.id, lightA.currentState);
                    mqttContext?.publish("traffic-light/state/" + lightB.id, lightB.currentState);
                }
            }
        }
    
        mqttContext?.subscribe(
            { topic: `traffic-light/${lightA.id}/ldr-state`, qos: 1 },
            handleLdrMessage
        );

        mqttContext?.subscribe(
            { topic: `traffic-light/${lightB.id}/ldr-state`, qos: 1 },
            handleLdrMessage
        );

        mqttContext?.subscribe(
            { topic: `traffic-light/${lightA.id}/walker-button`, qos: 1 },
            handleWalkerButtonMessage
        );

        mqttContext?.subscribe(
            { topic: `traffic-light/${lightB.id}/walker-button`, qos: 1 },
            handleWalkerButtonMessage
        );
        
        changeLightState(); // Inicia o ciclo de mudança de estados
    };
    
    const stopTrafficLightCycle = (crossroadIndex: number) => {
        clearTimeout(crossroadsTimeout.current[crossroadIndex]);
        mqttContext?.unsubscribe(`traffic-light/${crossroads[crossroadIndex][0].id}/ldr-state`);
        mqttContext?.unsubscribe(`traffic-light/${crossroads[crossroadIndex][1].id}/ldr-state`);
    }
    
    const isLightCycleRunning = (crossroadIndex: number) => {
        console.log("crossroadsTimeout.current: ", crossroadsTimeout.current);
        console.log("crossroadIndex: ", crossroadIndex);
        console.log("crossroadsTimeout.current[crossroadIndex]: ", crossroadsTimeout.current[crossroadIndex]);
        console.log("ref: ", crossroadsTimeout);
        return !!crossroadsTimeout.current[crossroadIndex];
    }

    useEffect(() => {
        if (mqttContext?.client && mqttContext?.status === "connected" && !isSubscribedAtNewTrafficLightsTopic) {
            console.log("Subscribing to new traffic lights topic");

            mqttContext?.subscribe({
                topic: "traffic-light/+/new",
                qos: 1,
            }, (topic) => {
                console.log("New traffic light found: ", topic);
                const lightId = topic.split("/")[1];
                console.log("Founds: ", foundTrafficLightsIdsRef.current);
                
                // Usa a referência atualizada para verificar e adicionar novos IDs
                if (!foundTrafficLightsIdsRef.current.includes(lightId)) {
                    setFoundTrafficLightsIds((prevIds) => [...prevIds, lightId]);
                }
            });
            setIsSubscribedAtNewTrafficLightsTopic(true);
        }

        return () => {
            mqttContext?.unsubscribe("traffic-light/+/new");
        }
    }, [mqttContext?.status]);

    return (
        <TrafficLightsContext.Provider
            value={{
                selectedTrafficLights,
                selectTrafficLight,
                deselectTrafficLight,
                selectedTrafficLight,
                setSelectedTrafficLight,
                crossroads,
                addTrafficLightToExistingCrossroad,
                addTrafficLightToNewCrossroad,
                addConfigurationToCrossroad,
                stopTrafficLightCycle,
                isLightCycleRunning,
                startTrafficLightCycle,
                deleteTrafficLight,
                foundTrafficLightsIds,
            }}
        >
            {children}
        </TrafficLightsContext.Provider>
    );
}
