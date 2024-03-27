export type KeymapItem = {
    keys: string[]
    mode: "normal" | "edit" | "command" | "always"
    description: string
}

export type Keymap = {
    up: KeymapItem;
    down: KeymapItem;
    insert: KeymapItem;
    insertTop: KeymapItem;
    appendBottom: KeymapItem;
    append: KeymapItem;
    editMode: KeymapItem;
    normalMode: KeymapItem;
};

export const keymap: Keymap = {
    up: {
        keys: ['k', 'ArrowUp'],
        mode: "normal",
        description: "上へ移動"
    },
    down: {
        keys: ['j', 'ArrowDown'],
        mode: "normal",
        description: "下へ移動"
    },
    insert: {
        keys: ['i',],
        mode: "normal",
        description: "タスクを前に追加"
    },
    append: {
        keys: ['a',],
        mode: "normal",
        description: "タスクを後ろに追加"
    },
    insertTop: {
        keys: ['shift+i',],
        mode: "normal",
        description: "タスクを一番上に追加"
    },
    appendBottom: {
        keys: ['shift+a',],
        mode: "normal",
        description: "タスクを一番下に追加"
    },
    editMode: {
        keys: ['Enter',],
        mode: "normal",
        description: "エディットモードに変更"
    },
    normalMode: {
        keys: ['Enter', 'Esc'],
        mode: "edit",
        description: "ノーマルモードに変更"
    },
}
