# Bare bones react combo-box

## Features

- Fast ⚡
- Customizable 🎨
- Navigation using arrow keys
- Searching for items
- Can handle up to 800 items, no virtualization 💪

## Example

![PNG](https://i.imgur.com/zyYpDdk.png)

## See it in action

![Gif](https://i.imgur.com/S61t2iw.gif)

## Docs

`Combo box component type:`

```ts
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
```

`Combo box styles type:`

```ts
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
```