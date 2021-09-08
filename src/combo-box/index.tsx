/* eslint-disable react-hooks/exhaustive-deps */
import { useState, memo, useRef, CSSProperties, useEffect, Ref } from "react";
import { makeStyles, createStyles } from "@material-ui/styles";
import useEventListener from "@use-it/event-listener";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            position: "relative",
            width: "auto",
            height: "auto",
            display: "flex",
            flexDirection: "column",
        },
        input: {
            height: "auto",
            border: "none",
            outline: "none",
        },
        inputContainer: {
            width: "100%",
            backgroundColor: "white",
        },
        item: {
            width: "100%",
            height: "auto",
        },
        itemsContainer: {
            width: "100%",
            maxHeight: "28vh",
            overflow: "auto",
        },
        items: {
            zIndex: 1,
            position: "absolute",
            top: "100%",
            width: "100%",
            outline: "none",
            height: "auto",
        },
    })
);

interface Item {
    name: string;
    selected: boolean;
    id: number;
};

const defaultItems = Array(30).fill(0).map((_, index) => {
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

    const itemsRef = useRef<HTMLDivElement[]>([]);

    // populate itemsRef
    useEffect(() => {
        itemsRef.current = itemsRef.current.slice(0, items.length);
    }, [items.length]);

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

        // sort the search
        const search = () => {
            setItems(prev => prev.sort((a, b) => {
                const left = a.name.toLowerCase();
                const right = b.name.toLowerCase();
                const query = input.toLowerCase();

                if (left.includes(query)) return -1;
                if (right.includes(query)) return 1;
                return 0;
            }));
        };
        search();
    };

    useEventListener("keydown", (ev: KeyboardEvent) => {
        if (ev.key === "Enter") {
            handleSelect(items.find(x => x.selected)?.id ?? -1);
            return;
        };

        if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
            setItems(prev => {
                // assign a temporary new variable
                let items = [...prev];
                // check which way we're going
                const way = ev.key === "ArrowUp" ? -1 : 1;

                let test: number = 0;
                // find the currently selected item and unselect it
                // also, get its id
                for (let i = 0; i < items.length; i++) {
                    if (items[i].selected) {
                        test = i + way;
                        items[i] = {
                            ...items[i],
                            selected: false,
                        };
                        break;
                    };
                };

                itemsRef.current[test]?.scrollIntoView({
                    behavior: "smooth",
                    inline: "nearest",
                    block: "nearest",
                });

                // select the new id
                if (!items[test]) {
                    if (way === -1) {
                        items[items.length - 1] = {
                            ...items[items.length - 1],
                            selected: true,
                        };
                    } else {
                        items[0] = {
                            ...items[0],
                            selected: true,
                        };
                    };
                    return items;
                };

                items[test] = {
                    ...items[test],
                    selected: true,
                };
                // finally, return the items
                return items;
            });
        };
    });

    // callback when the user has chosen an item
    useEffect(() => {
        onSelect && onSelect(chosen);
    }, [chosen]);

    return (<>
        <div>Input: {chosen}</div>
        {/** container for the combo-box */}
        <div className={classes.root}>
            {/** combo-box input */}

            <input
                type="text"
                className={classes.input}
                onChange={e => handleInput(e.target.value)}
                value={input}
                onFocus={() => setFocused(true)}
                // onBlur={() => setTimeout(() => setFocused(false), 100)}
            />
        

            {/** combo-box suggestions */}
            <div
                hidden={!focused}
                className={classes.items}
            >
                <div
                    className={classes.itemsContainer}
                    onBlur={() => setFocused(false)}
                    onFocus={() => setFocused(true)}
                    tabIndex={1}
                >
                    {items.map((value, index) => (
                        <ComboBoxItem
                            item={value}
                            onSelect={handleSelect}
                            onHover={handleHover}
                            key={value.id}
                            reference={el => {
                                (itemsRef.current[index] as any) = el;
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    </>);
};

interface ComboBoxItemProps {
    onSelect: (id: number) => void;
    onHover: (id: number) => void;
    item: Item;
    reference?: Ref<HTMLDivElement>;
    style?: CSSProperties;
};

const ComboBoxItem = memo(({ item, onSelect, onHover, style, reference }: ComboBoxItemProps) => {
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
            ref={reference}
        >
            <div>{item.name}</div>
        </div>
    );
});
