/* eslint-disable react-hooks/exhaustive-deps */
import { useState, memo, useRef, CSSProperties, useEffect, Ref } from "react";
import { makeStyles, createStyles } from "@material-ui/styles";
import useEventListener from "@use-it/event-listener";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            position: "relative",
            width: "100%",
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
            // bottom: "100%",
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

interface ComboBoxStyles {
    input?: CSSProperties;
    /**
     * every item div
     */
    item?: CSSProperties;
    /**
     * one div for all the items (container)
     */
    items?: CSSProperties
};

interface ComboBoxProps {
    /**
     * scroll type -> auto for instant, smooth for smooth
     */
    scroll?: "auto" | "smooth";
    /**
     * Pass in the items, {name, id}[]
     */
    options: { name: string; id: number }[];
    /**
     * Callback when the user has selected the item
     */
    onSelect?: (item: string, id: number) => any;
    /**
     * style the components yourself
     */
    style?: ComboBoxStyles;
};

function ComboBox({ onSelect, options, scroll = "auto", style }: ComboBoxProps) {
    const classes = useStyles();

    // all the items 
    const [items, setItems] = useState<Item[]>(
        options.map(x => ({ ...x, selected: false }))
    );
    // if we're focused, opens the combo box if true
    const [focused, setFocused] = useState(false);
    // currently search input
    const [input, setInput] = useState("");

    // the currently chosen option
    const [chosen, setChosen] = useState("");

    // holds all the items, so that it can scroll to them
    const itemsRef = useRef<HTMLDivElement[]>([]);
    // item container ref
    const itemsContainerRef = useRef<HTMLDivElement>(null);

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
        // set the input
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

        // scroll to the top
        itemsRef.current[0].scrollIntoView({
            behavior: scroll,
            inline: "nearest",
            block: "nearest",
        });
    };

    // navigation happens here
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
                    behavior: scroll,
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
        chosen && onSelect && onSelect(
            chosen, items.find(x => x.name === chosen)?.id ?? -1
        );
    }, [chosen]);

    return (<>
        {/** container for the combo-box */}
        <div className={classes.root}>
            {/** combo-box input */}
            <input
                type="text"
                className={classes.input}
                onChange={e => handleInput(e.target.value)}
                value={input}
                onFocus={() => setFocused(true)}
                style={style?.input}
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
                    ref={itemsContainerRef}
                    style={style?.items}
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
                            style={style?.item}
                        />
                    ))}
                </div>
            </div>
        </div>
    </>);
};
export default memo(ComboBox);

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
                backgroundColor: item.selected ? "#C7C7C7" : "#ffffff",
            }}
            onClick={() => onSelect(item.id)}
            onMouseMove={() => onHover(item.id)}
            ref={reference}
        >
            <div>{item.name}</div>
        </div>
    );
});
