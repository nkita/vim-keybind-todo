export type KeymapItem = {
    keys: string[]
    mode: "normal" | "edit" | "command" | "sort" | "always" | "noNormal"
    description: string
}

export type Keymap = {
    up: KeymapItem;
    down: KeymapItem;
    insert: KeymapItem;
    insertTop: KeymapItem;
    appendBottom: KeymapItem;
    completion: KeymapItem;
    append: KeymapItem;
    editTextMode: KeymapItem;
    editPriorityMode: KeymapItem;
    editProjectMode: KeymapItem;
    editContextMode: KeymapItem;
    moveProjectRight: KeymapItem;
    moveProjectLeft: KeymapItem;
    normalMode: KeymapItem;
    sortMode: KeymapItem;
    sortTextMode: KeymapItem;
    sortPriorityMode: KeymapItem;
    sortCompletionMode: KeymapItem;
    sortCreationDateMode: KeymapItem;
    sortContextMode: KeymapItem;
    sortClear: KeymapItem
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
    moveProjectRight: {
        keys: ['l', 'ArrowRight'],
        mode: "normal",
        description: "プロジェクトタブを右に移動"
    },
    moveProjectLeft: {
        keys: ['h', 'ArrowLeft'],
        mode: "normal",
        description: "プロジェクトタブを右に移動"
    },
    insert: {
        keys: ['i',],
        mode: "normal",
        description: "タスク追加（前）"
    },
    append: {
        keys: ['a',],
        mode: "normal",
        description: "タスク追加（後）"
    },
    insertTop: {
        keys: ['shift+i',],
        mode: "normal",
        description: "タスク追加（一番上）"
    },
    appendBottom: {
        keys: ['shift+a',],
        mode: "normal",
        description: "タスク追加（一番下）"
    },
    completion: {
        keys: ['x'],
        mode: "normal",
        description: "完了・未完了"
    },
    editTextMode: {
        keys: ['Enter',],
        mode: "normal",
        description: "タスクを編集"
    },
    editPriorityMode: {
        keys: ['p',],
        mode: "normal",
        description: "優先度を編集"
    },
    editProjectMode: {
        keys: ['0'],
        mode: "normal",
        description: "プロジェクトを編集"
    },
    editContextMode: {
        keys: ['@',],
        mode: "normal",
        description: "コンテキストを編集"
    },
    sortMode: {
        keys: ['s'],
        mode: "normal",
        description: "ソート"
    },
    sortTextMode: {
        keys: ['t'],
        mode: "sort",
        description: "タスク内容"
    },
    sortPriorityMode: {
        keys: ['p'],
        mode: "sort",
        description: "優先度"
    },
    sortCompletionMode: {
        keys: ['x'],
        mode: "sort",
        description: "タスク完了・未完了"
    },
    sortCreationDateMode: {
        keys: ['d'],
        mode: "sort",
        description: "作成日"
    },
    sortContextMode: {
        keys: ['@'],
        mode: "sort",
        description: "コンテキスト"
    },
    sortClear: {
        keys: ['Delete'],
        mode: "sort",
        description: "クリア"
    },
    normalMode: {
        keys: ['Esc', 'Enter'],
        mode: "noNormal",
        description: "戻る"
    },
}
