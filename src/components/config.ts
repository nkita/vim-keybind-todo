import { Sort, Mode } from "@/types"
export type KeymapItem = {
    keys: string[]
    keysDisp?: string[]
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
    editText: KeymapItem;
    delete: KeymapItem;
    editPriority: KeymapItem;
    editProject: KeymapItem;
    editContext: KeymapItem;
    editTextLine: KeymapItem;
    editPriorityLine: KeymapItem;
    editProjectLine: KeymapItem;
    editContextLine: KeymapItem;
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
    addToLine: KeymapItem;
    insertToLine: KeymapItem;
};

export const keymap: Keymap = {
    up: {
        keys: ['k', 'ArrowUp'],
        keysDisp: ['k', '⇡'],
        enable: { mode: ["normal", "sort", "number"], withoutTask: false },
        description: "上へ移動"
    },
    down: {
        keys: ['j', 'ArrowDown'],
        keysDisp: ['j', '↓'],
        enable: { mode: ["normal", "sort", "number"], withoutTask: false },
        description: "下へ移動"
    },
    moveProjectRight: {
        keys: ['l', 'ArrowRight'],
        keysDisp: ['l', '→'],
        enable: { mode: ["normal", "sort", "number"], },
        description: "プロジェクトタブを右に移動"
    },
    moveProjectLeft: {
        keys: ['h', 'ArrowLeft'],
        keysDisp: ['h', '←'],
        enable: { mode: ["normal", "sort", "number"] },
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
        keysDisp: ['I'],
        enable: { mode: ["normal"], sort: [undefined] },
        description: "タスク追加（一番上）"
    },
    insertTopOnSort: {
        keys: ['shift+i',],
        keysDisp: ['I'],
        enable: { mode: ["normal"], sort: ['priority', 'context', 'text', 'creationDate', 'isCompletion'] },
        description: "タスク追加"
    },
    appendBottom: {
        keys: ['shift+a',],
        keysDisp: ['A'],
        enable: { mode: ["normal"], sort: [undefined], withoutTask: false },
        description: "タスク追加（一番下）"
    },
    completion: {
        keys: ['x'],
        enable: { mode: ["normal"], withoutTask: false },
        description: "完了・未完了"
    },
    editText: {
        keys: ['Enter',],
        enable: { mode: ["normal"], withoutTask: false },
        description: "タスクを編集"
    },
    delete: {
        keys: ['d',],
        enable: { mode: ["normal"], withoutTask: false },
        description: "タスクを削除"
    },
    editPriority: {
        keys: ['p',],
        enable: { mode: ["normal"], withoutTask: false },
        description: "優先度を編集"
    },
    editProject: {
        keys: ['0'],
        enable: { mode: ["normal"], withoutTask: false },
        description: "プロジェクトを編集"
    },
    editContext: {
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
        keysDisp: ['数字'],
        enable: { mode: ["normal", "number"], withoutTask: false },
        description: "行番号指定"
    },
    moveToLine: {
        keys: ['shift+g'],
        keysDisp: ['G'],
        enable: { mode: ["number"], withoutTask: false },
        description: "指定した行へ移動"
    },
    addToLine: {
        keys: ['a'],
        enable: { mode: ["number"], sort: [undefined], withoutTask: false },
        description: "指定した行の次へタスクを追加"
    },
    insertToLine: {
        keys: ['i'],
        enable: { mode: ["number"], sort: [undefined], withoutTask: false },
        description: "指定した行の前へタスクを追加"
    },
    editProjectLine: {
        keys: ['0'],
        enable: { mode: ["number"], withoutTask: false },
        description: "指定した行のプロジェクトを編集"
    },
    editPriorityLine: {
        keys: ['p'],
        enable: { mode: ["number"], withoutTask: false },
        description: "指定した行のプライオリティを編集"
    },
    editContextLine: {
        keys: ['c'],
        enable: { mode: ["number"], withoutTask: false },
        description: "指定した行のコンテキストを編集"
    },
    editTextLine: {
        keys: ['t'],
        enable: { mode: ["number"], withoutTask: false },
        description: "指定した行のタスクを編集"
    },
}
