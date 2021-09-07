/* eslint-disable react-hooks/exhaustive-deps */
import { useState, memo, useRef, CSSProperties, useEffect } from "react";
import { makeStyles, createStyles } from "@material-ui/styles";

/* ---------------------------------------------------------------------------------------------- */
/*                                 https://i.imgur.com/XnghBD5.png                                */
/* ---------------------------------------------------------------------------------------------- */

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            position: "relative",
            width: "auto",
            height: "auto",
            borderRadius: "10%",
        },
        input: {
            width: "100%",
            height: "auto",
            border: "none",
            outline: "none",
        },
        inputContainer: {
            width: "100%",
            backgroundColor: "white",
            padding: 10,
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
    })
);

interface Item {
    name: string;
    selected: boolean;
    id: number;
};

const defaultItems = Array(20).fill(0).map((_, index) => {
    return {
        name: Math.random().toFixed(4),
        selected: false,
        id: index,
    };
});

interface ComboBoxProps {
    /**
     * Callback when the user has selected the item
     */
    onSelect?: (item: string) => any;
};

export default function ComboBox({ onSelect }: ComboBoxProps) {
    const classes = useStyles();

    const [items, setItems] = useState(defaultItems);
    const [focused, setFocused] = useState(false);
    const [input, setInput] = useState("");

    const [chosen, setChosen] = useState("");

    const itemsDivRef = useRef<HTMLDivElement>(null);

    // when the user chooses an item
    const handleSelect = (id: number) => {
        setItems(prev => {
            return prev.map(value => {
                if (value.id === id) {
                    setInput(value.name);
                    setChosen(value.name);
                    setFocused(false);

                    return { ...value, selected: true };
                };
                return { ...value, selected: false };
            });
        });
    };

    // when the user is hovering over the items
    const handleHover = (id: number) => {
        const item = items.find(x => x.id === id);

        if (item && !item.selected) {
            setItems(prev => {
                return prev.map(value => {
                    if (value.id === id) {
                        return { ...value, selected: true };
                    };
                    return { ...value, selected: false };
                });
            });
        };
    };

    // when the user is typing
    const handleInput = (input: string) => {
        setInput(input);
        if (input) setFocused(true);
    };

    // callback when the user has chosen an item
    useEffect(() => {
        onSelect && onSelect(chosen);
    }, [chosen]);

    return (<>
        <div>Input: {chosen}</div>
        {/** container for the combo-box */}
        <div className={classes.root}>
            {/** combo-box input */}
            <div
                className={classes.inputContainer}
                style={{
                    borderRadius: focused ? "7px 7px 0 0" : "7px",
                }}
            >
                <input
                    type="text"
                    className={classes.input}
                    onChange={e => handleInput(e.target.value)}
                    value={input}
                    onFocus={() => setFocused(true)}
                />
            </div>

            {/** combo-box suggestions */}
            <div
                hidden={!focused}
                onBlur={() => setFocused(false)}
                tabIndex={1}
                ref={itemsDivRef}
                className={classes.items}
            >
                {items.map((value, index) => (
                    <ComboBoxItem
                        item={value}
                        onSelect={handleSelect}
                        onHover={handleHover}

                        key={value.id}
                        style={{
                            borderRadius: index === items.length - 1 ?
                                "0 0 7px 7px" : undefined,
                        }}
                    />
                ))}
            </div>
        </div>
    </>);
};

interface ComboBoxItemProps {
    onSelect: (id: number) => void;
    onHover: (id: number) => void;
    item: Item;
    style?: CSSProperties;
};

const ComboBoxItem = memo(({ item, onSelect, onHover, style }: ComboBoxItemProps) => {
    const classes = useStyles();
    return (
        <div
            className={classes.item}
            style={{
                ...style,
                backgroundColor: item.selected ? "gray" : "white",
            }}
            onClick={() => onSelect(item.id)}
            onMouseMove={() => onHover(item.id)}
        >
            <div style={{ padding: 10 }}>{item.name}</div>
        </div>
    );
});
