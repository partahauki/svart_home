import React, { useContext, useMemo } from "react";
import { MqttContext } from "../contexts/MqttContext";
import IconCoffee from "../svg/Coffee.svg";


const containerCss: React.CSSProperties = {
    "display": "flex",
    "flexDirection": "row",
    "width": "16rem",
    "height": "16rem",
    "justifyContent": "center",
    "alignItems": "center",
    "border": "1px solid #C0C0C0",
    "borderRadius": "1rem",
    "margin": "1.2rem",
    "backgroundColor": "#404060",
};

const boxCss: React.CSSProperties = {
    "display": "flex",
    "flexDirection": "column",
}

let iconStyle: React.CSSProperties = {
    "padding": "0.5rem",
    "width": "10rem",
}

export const CoffeeItem: React.FC = () => {
    let {statuses: { coffee: coffeeStatus }, sendMessage} = useContext(MqttContext)

    const iconColor = useMemo(() => {
        if (!coffeeStatus) return "black";
        return coffeeStatus === "ON" ? "#10C0A0" : "#A04040";
    },[coffeeStatus]);

    return (
        <div style={containerCss} onClick={() => sendMessage("home/coffee/toggle", "")}>
            <div style={boxCss} >
                <IconCoffee style={{"fill": iconColor, ...iconStyle}} />
            </div>
        </div>
    );
}
