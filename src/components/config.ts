import { Sort, Mode } from "@/types"
export type KeymapItemType = "focus" | "edit" | "add" | "sort" | "other" | "view"
export type KeymapItem = {
    keys: string[]
    keysDisp?: string[]
    enable?: { sort?: Sort[], mode: Mode[], withoutTask?: boolean, useKey?: boolean } // and
    type: KeymapItemType[]
    description: string
    options?: any
}
export const completionTaskProjectName = "__completion_task_project__"
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
    deleteModal: KeymapItem;
    delete: KeymapItem;
    increasePriority: KeymapItem;
    decreasePriority: KeymapItem;
    editProject: KeymapItem;
    editContext: KeymapItem;
    editTextLine: KeymapItem;
    editDetail: KeymapItem;
    editProjectLine: KeymapItem;
    editContextLine: KeymapItem;
    moveProjectRight: KeymapItem;
    moveProjectLeft: KeymapItem;
    // sortMode: KeymapItem;
    sortPriority: KeymapItem;
    sortCreationDate: KeymapItem;
    sortContext: KeymapItem;
    sortCompletion: KeymapItem;
    sortClear: KeymapItem
    normalMode: KeymapItem;
    normalModefromEditDetail: KeymapItem;
    normalModefromEditDetailText: KeymapItem;
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
    save: KeymapItem;
    undo: KeymapItem;
    redo: KeymapItem;
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
        type: ["add"],
        description: "タスク追加（前）"
    },
    append: {
        keys: ['a',],
        enable: { mode: ["normal"], sort: [undefined], withoutTask: false },
        type: ["add"],
        description: "タスク追加（後）"
    },
    insertTop: {
        keys: ['shift+i',],
        keysDisp: ['I'],
        enable: { mode: ["normal"], sort: [undefined] },
        type: ["add"],
        description: "タスク追加（一番上）"
    },
    insertTopOnSort: {
        keys: ['shift+i',],
        keysDisp: ['I'],
        enable: { mode: ["normal"], sort: ['priority', 'context', 'text', 'creationDate', 'is_complete'] },
        type: ["add"],
        description: "タスク追加"
    },
    appendBottom: {
        keys: ['shift+a',],
        keysDisp: ['A'],
        enable: { mode: ["normal"], sort: [undefined], withoutTask: false },
        type: ["add"],
        description: "タスク追加（一番下）"
    },
    completion: {
        keys: ['Space'],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["edit"],
        description: "完了・未完了"
    },
    editText: {
        keys: ['Enter', 'shift+t'],
        keysDisp: ['Enter', 'T'],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["edit"],
        description: "タスクを編集"
    },
    deleteModal: {
        keys: ['delete'],
        keysDisp: ["Del"],
        enable: { mode: ["normal"], withoutTask: false, useKey: true },
        type: ["edit"],
        description: "タスクを削除"
    },
    delete: {
        keys: ['Enter'],
        keysDisp: ["Enter"],
        enable: { mode: ["modal"], withoutTask: false, useKey: true },
        type: ["edit"],
        description: "タスクを削除"
    },
    increasePriority: {
        keys: ['='],
        enable: { mode: ["normal"], withoutTask: false, useKey: true },
        type: ["edit"],
        description: "優先度を上げる"
    },
    decreasePriority: {
        keys: ['-'],
        enable: { mode: ["normal"], withoutTask: false, useKey: true },
        type: ["edit"],
        description: "優先度を下げる"
    },
    editProject: {
        keys: ['Shift+p'],
        keysDisp: ['P',],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["edit"],
        description: "プロジェクトを編集"
    },
    editContext: {
        keys: ['Shift+l',],
        keysDisp: ['L',],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["edit"],
        description: "ラベルを編集"
    },
    // sortMode: {
    //     keys: ['s'],
    //     enable: { mode: ["normal"] },
    //     type: ["sort"],
    //     description: "ソート"
    // },
    sortPriority: {
        keys: ['p',],
        enable: { mode: ["sort"] },
        type: ["sort"],
        description: "優先度"
    },
    sortCreationDate: {
        keys: ['d'],
        enable: { mode: ["sort"] },
        type: ["sort"],
        description: "作成日"
    },
    sortContext: {
        keys: ['shift+l'],
        keysDisp: ['L'],
        enable: { mode: ["sort"] },
        type: ["sort"],
        description: "ラベル"
    },
    sortCompletion: {
        keys: ['Space'],
        enable: { mode: ["sort"] },
        type: ["sort"],
        description: "完了・未完了"
    },
    sortClear: {
        keys: ['q'],
        enable: { mode: ["sort"] },
        type: ["sort"],
        description: "ソート解除"
    },
    normalMode: {
        keys: ['Esc', 'Enter'],
        enable: { mode: ["edit", "command", "sort", 'number'] },
        type: ["other"],
        description: "戻る"
    },
    normalModeOnSort: {
        keys: ['Esc', 'Enter'],
        enable: { mode: ["editOnSort"] },
        type: ["other"],
        description: "戻る"
    },
    normalModefromEditDetail: {
        keys: ['Esc'],
        enable: { mode: ["editDetail", "modal"] },
        type: ["other"],
        description: "戻る"
    },
    normalModefromEditDetailText: {
        keys: ['Enter'],
        enable: { mode: ["editDetail", "modal"] },
        type: ["other"],
        description: "戻る"
    },
    toggleCompletionTask: {
        keys: ['v'],
        enable: { mode: ["normal", "command"] },
        type: ["view"],
        description: "完了済みタスクの表示・非表示"
    },
    numberMode: {
        keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        keysDisp: ['数字'],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["other"],
        description: "行番号を入力"
    },
    numberInput: {
        keys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        keysDisp: ['数字'],
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
        keys: ['shift+p'],
        keysDisp: ["P"],
        enable: { mode: ["number"], withoutTask: false },
        type: ["edit"],
        description: "指定した行のプロジェクトを編集"
    },
    editContextLine: {
        keys: ['shift+l'],
        keysDisp: ["L"],
        enable: { mode: ["number"], withoutTask: false },
        type: ["edit"],
        description: "指定した行のラベルを編集"
    },
    editTextLine: {
        keys: ['shift+t'],
        keysDisp: ['T'],
        enable: { mode: ["number"], withoutTask: false },
        type: ["edit"],
        description: "指定した行のタスクを編集"
    },
    editDetail: {
        keys: ['shift+d'],
        keysDisp: ['D'],
        enable: { mode: ["normal"], withoutTask: false },
        type: ["edit"],
        description: "詳細を編集する"
    },
    searchMode: {
        keys: ['/'],
        enable: { mode: ["normal", "sort"], withoutTask: false, useKey: true },
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
        keys: ['?'],
        enable: { mode: ["normal", "sort", "command"], withoutTask: true, useKey: true },
        type: ["other"],
        description: "ヘルプの表示・非表示"
    },
    save: {
        keys: ['Control+s'],
        keysDisp: ['Ctrl+S'],
        enable: { mode: ["normal"], withoutTask: true },
        type: ["other"],
        description: "保存"
    },
    undo: {
        keys: ['u'],
        enable: { mode: ["normal"], withoutTask: true },
        type: ["other"],
        description: "前の状態に戻る(undo)"
    },
    redo: {
        keys: ['Control+r'],
        enable: { mode: ["normal"], withoutTask: true },
        type: ["other"],
        description: "前の状態に戻る(redo)"
    }
}