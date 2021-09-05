import { useState, useEffect, memo, useRef } from "react";
import { makeStyles, createStyles } from "@material-ui/styles";

/* ---------------------------------------------------------------------------------------------- */
/*                                 https://i.imgur.com/XnghBD5.png                                */
/* ---------------------------------------------------------------------------------------------- */

const useStyles = makeStyles(() => createStyles({
    root: {
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
    },
    input: {
        width: "100%",
        height: "auto",
        borderRadius: 0,
        outline: "none",
        border: "none",
    },
    item: {
        width: "100%",
        height: "auto",
    },
    items: {
        zIndex: 1,
        position: "absolute",
        top: "100%",
        width: "100%",
        outline: "none",
        maxHeight: "30vh",
        overflow: "auto",
    },
}));

interface Item {
    name: string;
    selected: boolean;
    id: number;
};

const defaultItems = [
    {
        name: "Option 1",
        selected: false,
        id: 0,
    },
    {
        name: "Option 2",
        selected: false,
        id: 1,
    },
] as Item[];

export default function ComboBox() {
    const classes = useStyles();

    const [items, setItems] = useState(defaultItems);
    const [focused, setFocused] = useState(false);
    const [input, setInput] = useState("");

    const [chosen, setChosen] = useState("");

    const itemsDivRef = useRef<HTMLDivElement>(null);

    const handleSelect = (name: string) => {
        setItems(prev => {
            return prev.map(value => {
                if (value.name === name) {
                    return { ...value, selected: true };
                };
                return { ...value, selected: false };
            });
        });
        setInput(name);
        setChosen(name);
        setFocused(false);
    };

    const handleInput = (input: string) => {
        setInput(input);
        if (input) setFocused(true);
    };

    useEffect(() => {
        const navigation = (ev: KeyboardEvent) => {
            if (ev.key === "Enter") {
                // TODO
                return;
            };
            // ArrowUp 
            // ArrowDown

            const navigate = (type: "ArrowDown" | "ArrowUp") => {
                ev.preventDefault();
                setItems(prev => {
                    return prev.map((value, index) => {
                        if (prev[index + (type === "ArrowUp" ? 1 : -1)]) {
                            setInput(value.name);
                            return { ...value, selected: true };
                        };
                        return { ...value, selected: false };
                    });
                });
                itemsDivRef.current?.focus();
            };

            // move up
            if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
                navigate(ev.key);
            };
        };
        document.addEventListener("keydown", navigation);

        return () => document.removeEventListener("keydown", navigation);
    }, []);

    return (<>
        <div>Input: {chosen}</div>

        {/** container for the combo-box */}
        <div className={classes.root}>
            {/** combo-box input */}
            <div style={{ width: "100%", backgroundColor: "white" }}>
                <div style={{ padding: 10 }}>
                    <input
                        type="text"
                        className={classes.input}
                        onChange={e => handleInput(e.target.value)}
                        value={input}
                        onFocus={() => setFocused(true)}
                    />
                </div>
            </div>
            
            {/** combo-box suggestions */}
            <div
                hidden={!focused}
                onBlur={() => setFocused(false)}
                tabIndex={1}
                ref={itemsDivRef}
                className={classes.items}
            >
                {items.map(value => (
                    <ComboBoxItem
                        item={value}
                        onSelect={handleSelect}
                        key={value.id}
                    />
                ))}
            </div>
        </div>
    </>);
};

interface ComboBoxItemProps {
    onSelect: (name: string) => void;
    item: Item;
};

const ComboBoxItem = memo(({ item, onSelect }: ComboBoxItemProps) => {
    const classes = useStyles();
    return (
        <div
            className={classes.item}
            style={{
                backgroundColor: item.selected ? "gray" : "white",
            }}
            onClick={() => onSelect(item.name)}
        >
            <div style={{ padding: 10 }}>
                {item.name}
            </div>
        </div>
    );
});