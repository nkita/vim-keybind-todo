import { Sort, Mode } from "@/types"
export type KeymapItem = {
    keys: string[]
    enable?: { sort?: Sort[], mode: Mode[], withoutTask?: boolean } // and
    description: string
}

export type Keymap = {
    up: KeymapItem;
    down: KeymapItem;
    insert: KeymapItem;
    insertTop: KeymapItem;
    insertTopOnSort: KeymapItem;
    appendBottom: KeymapItem;
    completion: KeymapItem;
    append: KeymapItem;
    editTextMode: KeymapItem;
    delete: KeymapItem;
    editPriorityMode: KeymapItem;
    editProjectMode: KeymapItem;
    editContextMode: KeymapItem;
    moveProjectRight: KeymapItem;
    moveProjectLeft: KeymapItem;
    sortMode: KeymapItem;
    sortPriority: KeymapItem;
    sortCreationDate: KeymapItem;
    sortContext: KeymapItem;
    sortCompletion: KeymapItem;
    sortClear: KeymapItem
    normalMode: KeymapItem;
    normalModeOnSort: KeymapItem;
    toggleCompletionTask: KeymapItem;
    numberMode: KeymapItem;
    moveToLine: KeymapItem;
};

export const keymap: Keymap = {
    up: {
        keys: ['k', 'ArrowUp'],
        enable: { mode: ["normal"], withoutTask: false },
        description: "上へ移動"
    },
    down: {
        keys: ['j', 'ArrowDown'],
        enable: { mode: ["normal"], withoutTask: false },
        description: "下へ移動"
    },
    moveProjectRight: {
        keys: ['l', 'ArrowRight'],
        enable: { mode: ["normal"], },
        description: "プロジェクトタブを右に移動"
    },
    moveProjectLeft: {
        keys: ['h', 'ArrowLeft'],
        enable: { mode: ["normal"] },
        description: "プロジェクトタブを右に移動"
    },
    insert: {
        keys: ['i',],
        enable: { mode: ["normal"], sort: [undefined], withoutTask: false },
        description: "タスク追加（前）"
    },
    append: {
        keys: ['a',],
        enable: { mode: ["normal"], sort: [undefined], withoutTask: false },
        description: "タスク追加（後）"
    },
    insertTop: {
        keys: ['shift+i',],
        enable: { mode: ["normal"], sort: [undefined] },
        description: "タスク追加（一番上）"
    },
    insertTopOnSort: {
        keys: ['shift+i',],
        enable: { mode: ["normal"], sort: ['priority', 'context', 'text', 'creationDate', 'isCompletion'] },
        description: "タスク追加"
    },
    appendBottom: {
        keys: ['shift+a',],
        enable: { mode: ["normal"], sort: [undefined], withoutTask: false },
        description: "タスク追加（一番下）"
    },
    completion: {
        keys: ['x'],
        enable: { mode: ["normal"], withoutTask: false },
        description: "完了・未完了"
    },
    editTextMode: {
        keys: ['Enter',],
        enable: { mode: ["normal"], withoutTask: false },
        description: "タスクを編集"
    },
    delete: {
        keys: ['d',],
        enable: { mode: ["normal"], withoutTask: false },
        description: "タスクを削除"
    },
    editPriorityMode: {
        keys: ['p',],
        enable: { mode: ["normal"], withoutTask: false },
        description: "優先度を編集"
    },
    editProjectMode: {
        keys: ['0'],
        enable: { mode: ["normal"], withoutTask: false },
        description: "プロジェクトを編集"
    },
    editContextMode: {
        keys: ['@',],
        enable: { mode: ["normal"], withoutTask: false },
        description: "コンテキストを編集"
    },
    sortMode: {
        keys: ['s'],
        enable: { mode: ["normal"] },
        description: "ソート"
    },
    sortPriority: {
        keys: ['p'],
        enable: { mode: ["sort"] },
        description: "優先度"
    },
    sortCreationDate: {
        keys: ['d'],
        enable: { mode: ["sort"] },
        description: "作成日"
    },
    sortContext: {
        keys: ['@'],
        enable: { mode: ["sort"] },
        description: "コンテキスト"
    },
    sortCompletion: {
        keys: ['x'],
        enable: { mode: ["sort"] },
        description: "完了・未完了"
    },
    sortClear: {
        keys: ['q'],
        enable: { mode: ["sort"] },
        description: "ソート解除"
    },
    normalMode: {
        keys: ['Esc', 'Enter'],
        enable: { mode: ["edit", "command", "sort", 'number'] },
        description: "戻る"
    },
    normalModeOnSort: {
        keys: ['Esc', 'Enter'],
        enable: { mode: ["editOnSort"] },
        description: "戻る"
    },
    toggleCompletionTask: {
        keys: ['v'],
        enable: { mode: ["normal", "command"] },
        description: "完了済みタスクの表示・非表示"
    },
    numberMode: {
        keys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        enable: { mode: ["normal", "number"] },
        description: "行番号指定"
    },
    moveToLine: {
        keys: ['shift+g'],
        enable: { mode: ["number"] },
        description: "指定した行へ移動"
    },
}
