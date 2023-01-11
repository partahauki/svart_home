import React, { useEffect, useState, useCallback } from "react";
import mqtt, { MqttClient } from "precompiled-mqtt";
import env from "react-dotenv";

type CoffeeStatus = "ON" | "OFF" | null
interface Statuses {
    coffee: CoffeeStatus;
}

interface MqttContextProps {
    statuses: Statuses;
    sendMessage: (topic: string, payload: string) => void ;
}
  
export const MqttContext = React.createContext<MqttContextProps>({
  statuses: {
    coffee: null,
  },
  sendMessage: () => undefined,
});
  
interface MqttProviderProps {
  children: React.ReactNode;
  contextProps?: Partial<MqttContextProps>;
}

export const MqttProvider: React.FC<MqttProviderProps> = ({
  children,
  contextProps,
}) => {
  const [client, setClient] = useState<MqttClient | null>(null)
  const [coffeeStatus, setCoffeeStatus] = useState<CoffeeStatus>(null);

  const sendMessage = useCallback((topic: string, payload: string) => {
    console.log("sending message to topic: " + topic );
    client?.publish(topic, payload);
  },[client]);

  useEffect(() => {
    setClient(mqtt.connect(env.MQTT_BROKER_ADDR, {
      protocolId: 'MQIsdp',
      protocolVersion: 3,
    }));
  }, []);

  useEffect(() => {
    if (!client) return;

    client.subscribe("home/coffee/status", (err) => {
      if (err) {
        console.log("Failed to subscribe to coffee-status");
        console.error(err);
        return
      }
      console.log("subscribed to coffee-status");
    });
    client.on("message", (topic, message) => {
      console.log(`Received message from topic ${topic}: ${message.toString()}`);
      switch(topic) {
        case "home/coffee/status": {
          setCoffeeStatus(message.toString() as CoffeeStatus);
        }
      }
    })
    client.publish("home/coffee/queryStatus", "");
  }, [client]);

  return (
    <MqttContext.Provider
      value={{
        statuses: {
          coffee: coffeeStatus,
        },
        sendMessage,
        ...contextProps
      }}
    >
      {children}
    </MqttContext.Provider>
  )
}