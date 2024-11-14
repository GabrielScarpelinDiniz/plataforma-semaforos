import mqtt, { MqttClient } from "mqtt";
import { createContext, useCallback, useEffect, useRef, useState } from "react";

const MqttContext = createContext<{
    client: MqttClient | null;
    connect: () => void;
    disconnect: () => void;
    subscribe: (subscribe: { topic: string, qos: 0 | 1 | 2}, onMessage: (topic: string, message: string) => void) => void;
    publish: (topic: string, message: string, qos?: 0 | 1 | 2) => void;
    unsubscribe: (topic: string) => void;
    status: "connecting" | "connected" | "disconnected" | "reconnecting" | "error";
} | null>(null);

export { MqttContext };

export default function MqttClientContext({
    brokerUrl,
    options,
    children,
}: {
    brokerUrl: string;
    options?: mqtt.IClientOptions;
    children: React.ReactNode;
}){
    const [client, setClient] = useState<MqttClient | null>(null);
    const [status, setStatus] = useState<"connecting" | "connected" | "disconnected" | "reconnecting" | "error">("disconnected");
    const [messageCallbacks, setMessageCallbacks] = useState<Record<string, (topic: string, message: string) => void>>({});

    const messageCallbacksRef = useRef(messageCallbacks);

    useEffect(() => {
        messageCallbacksRef.current = messageCallbacks;
    }, [messageCallbacks]);

    const connect = () => {
        console.log("Connecting to broker: ", brokerUrl);
        setClient(mqtt.connect(brokerUrl, options));
        setStatus("connecting");
    };

    const disconnect = () => {
        client?.end();
        setClient(null);
    };

    const matchTopic = (topic: string, subscribedTopic: string) => {
        if (subscribedTopic === topic) {
            return subscribedTopic;
        }
        const subParts = subscribedTopic.split("/");
        const topicParts = topic.split("/");

        const match = subParts.every((subPart, i) => {
            if (subPart === "#") return i === subParts.length - 1;
            if (subPart === "+") return !!topicParts[i];
            return subPart === topicParts[i];
        }) && subParts.length <= topicParts.length;

        if (match) {
            return subscribedTopic;
        }
        return null;
    }

    const subscribe = (subscribe: { topic: string, qos: 0 | 1 | 2}, onMessage: (topic: string, message: string) => void) => {
        client?.subscribe(subscribe.topic, { qos: subscribe.qos }, (err) => {
            if(err){
                console.error("Error subscribing to topic: ", err);
                return;
            }
            console.log("Subscribed to topic: ", subscribe.topic);
            setMessageCallbacks((prevCallbacks) => ({ ...prevCallbacks, [subscribe.topic]: onMessage }));
        });
    }

    const receiveMessage = useCallback((topic: string, payload: Buffer) => {
        console.log("Received message: ", payload.toString());
        console.log("From topic: ", topic);
        const messageString = payload.toString();
        console.log(messageCallbacksRef.current);

        Object.keys(messageCallbacksRef.current).forEach((subscribedTopic) => {
            const matchedTopic = matchTopic(topic, subscribedTopic);
            console.log("Matched topic: ", matchedTopic);
            if (matchedTopic) {
                messageCallbacksRef.current[subscribedTopic](topic, messageString);
            }
        });
    }, []);

    const unsubscribe = (topic: string) => {
        client?.unsubscribe(topic, (err) => {
            if(err){
                console.error("Error unsubscribing to topic: ", err);
                return;
            }
            setMessageCallbacks((prev) => {
                const newCallbacks = { ...prev };
                delete newCallbacks[topic];
                return newCallbacks;
            });
        });
    }

    const publish = (topic: string, message: string, qos: 0 | 1 | 2 = 1) => {
        client?.publish(topic, message, { qos });
    }

    useEffect(() => {
        console.log("Setting up client: ", client);
        if(client){
            console.log("Setting up event listeners");

            client.on("connect", () => {
                console.log("Connected to broker");
                setStatus("connected");
            });
            client.on("reconnect", () => {
                console.log("Reconnecting...");
                setStatus("reconnecting");
            });
            client.on("close", () => {
                console.log("Disconnected from broker");
                setStatus("disconnected");
            });
            client.on("error", (err) => {
                console.error("Error connecting to broker: ", err);
                setStatus("error");
            });
            client.on("message", receiveMessage);
        }
        else if (status === "disconnected" && !client) {
            connect();
        }
        return () => {
            client?.end();
        };
    }, [client]);


    return (
        <MqttContext.Provider value={{ client, connect, disconnect, status, subscribe, publish, unsubscribe }}>
            {children}
        </MqttContext.Provider>
    );
}
