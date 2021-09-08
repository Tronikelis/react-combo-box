import { useState } from "react";

import ComboBox from "./combo-box";

const options = Array(800)
    .fill(0)
    .map((_, id) => ({
        name: Math.random().toFixed(4),
        id,
    }));

interface Item {
    name: string;
    id: number;
};

export default function Test() {
    const [item, setItem] = useState<Item>();

    return (<div style={{  padding: 100,}}>
        {item?.name}
        <ComboBox
            options={options}
            onSelect={(name, id) => setItem({ name, id })}
        />  
    </div>);
};