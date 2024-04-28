import { Sort, Mode } from "@/types"
export type KeymapItemType = "focus" | "edit" | "other"
export type KeymapItem = {
    keys: string[]
    keysDisp?: string[]
    enable?: { sort?: Sort[], mode: Mode[], withoutTask?: boolean } // and
    type: KeymapItemType[]
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
    numberInput: KeymapItem;
    moveToLine: KeymapItem;
    moveToTop: KeymapItem;
    moveToEnd: KeymapItem;
    appendToLine: KeymapItem;
    insertToLine: KeymapItem;
    searchMode: KeymapItem;
    searchKeyword: KeymapItem;
    searchEsc: KeymapItem;
    searchEnter: KeymapItem;
    viewHelp: KeymapItem;
};

export const keymap: Keymap = {
    up: {
        keys: ['k', 'ArrowUp'],
        keysDisp: ['k'],
        enable: { mode: ["normal", "sort", "number"], withoutTask: false },
        type: ["focus"],
        description: "上へ移動"
    },
    down: {
        keys: ['j', 'ArrowDown'],
        keysDisp: ['j'],
        enable: { mode: ["normal", "sort", "number"], withoutTask: false },
        type: ["focus"],
        description: "下へ移動"
    },
    moveProjectRight: {
        keys: ['l', 'ArrowRight'],
        keysDisp: ['l'],
        enable: { mode: ["normal", "sort", "number"], },
        type: ["focus"],
        description: "プロジェクトタブを右に移動"
    },
    moveProjectLeft: {
        keys: ['h', 'ArrowLeft'],
        keysDisp: ['h'],
        enable: { mode: ["normal", "sort", "number"] },
        type: ["focus"],
        description: "プロジェクトタブを左に移動"
    },
    insert: {
        keys: ['i',],
        enable: { mode: ["normal"], sort: [undefined], withoutTask: false },
        type: ["edit"],
        description: "タスク追加（前）"
    },
    append: {
        keys: ['a',],
        enable: { mode: ["normal"], sort: [undefined], withoutTask: false },
        type: ["edit"],
        description: "タスク追加（後）"
    },
    insertTop: {
        keys: ['shift+i',],
        keysDisp: ['I'],
        enable: { mode: ["normal"], sort: [undefined] },
        type: ["edit"],
        description: "タスク追加（一番上）"
    },
    insertTopOnSort: {
        keys: ['shift+i',],
        keysDisp: ['I'],
        enable: { mode: ["normal"], sort: ['priority', 'context', 'text', 'creationDate', 'isCompletion'] },
        type: ["edit"],
        description: "タスク追加"
    },
    appendBottom: {
        keys: ['shift+a',],
        keysDisp: ['A'],
        enable: { mode: ["normal"], sort: [undefined], withoutTask: false },
        type: ["edit"],
        description: "タスク追加（一番下）"
    },
    completion: {
        keys: ['x'],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["edit"],
        description: "完了・未完了"
    },
    editText: {
        keys: ['Enter',],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["edit"],
        description: "タスクを編集"
    },
    delete: {
        keys: ['d',],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["edit"],
        description: "タスクを削除"
    },
    editPriority: {
        keys: ['p',],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["edit"],
        description: "優先度を編集"
    },
    editProject: {
        keys: [':'],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["edit"],
        description: "プロジェクトを編集"
    },
    editContext: {
        keys: ['@',],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["edit"],
        description: "コンテキストを編集"
    },
    sortMode: {
        keys: ['s'],
        enable: { mode: ["normal"] },
        type: ["other"],
        description: "ソート"
    },
    sortPriority: {
        keys: ['p'],
        enable: { mode: ["sort"] },
        type: ["other"],
        description: "優先度"
    },
    sortCreationDate: {
        keys: ['d'],
        enable: { mode: ["sort"] },
        type: ["other"],
        description: "作成日"
    },
    sortContext: {
        keys: ['@'],
        enable: { mode: ["sort"] },
        type: ["other"],
        description: "コンテキスト"
    },
    sortCompletion: {
        keys: ['x'],
        enable: { mode: ["sort"] },
        type: ["other"],
        description: "完了・未完了"
    },
    sortClear: {
        keys: ['q'],
        enable: { mode: ["sort"] },
        type: ["other"],
        description: "ソート解除"
    },
    normalMode: {
        keys: ['Esc', 'Enter'],
        enable: { mode: ["edit", "command", "sort", 'number'] },
        type: ["edit"],
        description: "戻る"
    },
    normalModeOnSort: {
        keys: ['Esc', 'Enter'],
        enable: { mode: ["editOnSort"] },
        type: ["edit"],
        description: "戻る"
    },
    toggleCompletionTask: {
        keys: ['v'],
        enable: { mode: ["normal", "command"] },
        type: ["other"],
        description: "完了済みタスクの表示・非表示"
    },
    numberMode: {
        keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        keysDisp: ['数字キー'],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["focus", "edit"],
        description: "行番号を入力"
    },
    numberInput: {
        keys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        keysDisp: ['数字キー'],
        enable: { mode: ["number"], withoutTask: false },
        type: [],
        description: "行番号を入力"
    },
    moveToLine: {
        keys: ['shift+g'],
        keysDisp: ['G'],
        enable: { mode: ["number"], withoutTask: false },
        type: ["focus"],
        description: "指定した行へ移動"
    },
    moveToTop: {
        keys: ['0'],
        keysDisp: ['0'],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["focus"],
        description: "先頭に移動"
    },
    moveToEnd: {
        keys: ['shift+g'],
        keysDisp: ['G'],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["focus"],
        description: "最終行に移動"
    },
    appendToLine: {
        keys: ['a'],
        enable: { mode: ["number"], sort: [undefined], withoutTask: false },
        type: ["edit"],
        description: "指定した行の次へタスクを追加"
    },
    insertToLine: {
        keys: ['i'],
        enable: { mode: ["number"], sort: [undefined], withoutTask: false },
        type: ["edit"],
        description: "指定した行の前へタスクを追加"
    },
    editProjectLine: {
        keys: [':'],
        enable: { mode: ["number"], withoutTask: false },
        type: ["edit"],
        description: "指定した行のプロジェクトを編集"
    },
    editPriorityLine: {
        keys: ['p'],
        enable: { mode: ["number"], withoutTask: false },
        type: ["edit"],
        description: "指定した行のプライオリティを編集"
    },
    editContextLine: {
        keys: ['c'],
        enable: { mode: ["number"], withoutTask: false },
        type: ["edit"],
        description: "指定した行のコンテキストを編集"
    },
    editTextLine: {
        keys: ['t'],
        enable: { mode: ["number"], withoutTask: false },
        type: ["edit"],
        description: "指定した行のタスクを編集"
    },
    searchMode: {
        keys: ['/'],
        enable: { mode: ["normal", "sort"], withoutTask: false },
        type: ["other"],
        description: "検索"
    },
    searchKeyword: {
        keys: ['*'],
        enable: { mode: ["search"], withoutTask: false },
        keysDisp: ["キーワード"],
        type: ["other"],
        description: "検索"
    },
    searchEsc: {
        keys: ['Esc'],
        enable: { mode: ["search"], withoutTask: false },
        type: ["other"],
        description: "キャンセル"
    },
    searchEnter: {
        keys: ['Enter'],
        enable: { mode: ["search"], withoutTask: false },
        type: ["other"],
        description: "検索"
    },
    viewHelp: {
        keys: ['H'],
        enable: { mode: ["normal"], withoutTask: true },
        type: ["other"],
        description: "ヘルプの表示・非表示"
    }
}