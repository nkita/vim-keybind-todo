# はじめに

キーボード操作のみで管理できるTodoWebアプリケーションです。
デフォルトはvimのキーバインドを参考に設定しています。

## Demo

[Demo Page](http://example.com)

## 　コンセプト

このツールは以下の点を考慮して作成しています。

* Todoをキーボードで完全に操作することが可能
* 汎用的なフォーマットのTodoであること

汎用的なフォーマットとしてTodo.txtのフォーマットを遵守し、Exportする際のフォーマットはこれに準じます。  
下記が本ツールにおける１つのtodoのフォーマットです。  

### Todoフォーマット

```text:format
[Completion mark] [Priolity mark] [Completion date] [Creation Date] [Todo text] [Project tag] [Context tag] [Due date] [Todo detail text]
```

### Todo例

```text:example
x (A) 2024-02-01 2024-01-01 go to home +Private @shopping due:2024-02-01 detail:buy new item. \n ・oops
```

## モード

モードは下記の通り３つのモードから様々な操作を行えるようにしています。

| モード名| 説明|
| :--- | :--- |
| ノーマルモード(normal)|　フォーカス移動、タスクの追加、削除などの基本的な操作を行うモードになり、デフォルトの状態となります。  |
| エディットモード(edit)| タスク内容や、優先度等タスク情報に関する修正を行うモードとなります。 |
| コマンドモード(command) | 特殊な操作を行うモードとなります。|

## 使い方

### Normal Mode

| event | default keymap | todo.txt format|
| :--- | :---: | :--- |
| 上へ移動 | `k` or `↑` |  -|
| 下へ移動| `j`  or `↓`| - |
| 先頭にタスクを追加(Insert)| `I` | - |
| フォーカス位置にタスクを挿入(insert)| `i` | - |
| タスクを完了・未完了| `space` | Check completion mark |
| 編集する（編集モード切り替え）| e | todo |
| 優先度を編集する| | mark priority (A-Z)|
| コンテキストを編集|  | Project Tag |
| プロジェクトを編集|  | Context Tag |
| コピー| `y` or `c` | - |
| フォーカス中のタスクの下部にペースト| `p` | - |
| フォーカス中のタスクの上部にペースト| `P` | - |
| 締切日を編集| E |  due:|
| 詳細を編集する（編集モード切り替え）| E |  detail: |

## Edit Mode

### タスクの編集

| event | default map | description |
| :--- | :---: | ---: |
| 編集を終了 | Esc |  |

### タスク詳細の編集

| event | default map | description |
| :--- | :---: | ---: |
| 編集を終了 | Esc |  |

### タスクの締切日を編集

| event | default map | description |
| :--- | :---: | ---: |
| 編集を終了 | Esc |  |

## todo type

```typescript
interface Todo {
    isCompletion?   : boolean
    priority?       : string    // a character. A-Z Uppercase
    completionDate? : string    // format yyyy-mm-dd
    creationDate?   : string    // format yyyy-mm-dd
    text            : string
    project?        : string    // +projctname
    context?        : string    // @context
}
```
