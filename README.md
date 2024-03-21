# はじめに

これはvimのkeybindで管理可能なtodoWebアプリケーションのプロジェクトです。

## URL

[Demo Page](http://example.com)

## key bind

### Normal Mode

| event | default keymap | todo.txt format|
| :--- | :---: | :--- |
| 上へ移動 | `k` or `↑` |  -|
| 下へ移動| `j`  or `↓`| - |
| 先頭にタスクを追加|  |  |
| フォーカス位置にタスクを追加|  |  |
| タスクを完了・未完了| `space` | Check completion mark |
| 編集する（編集モード切り替え）| e | todo |
| 優先度を編集する| | mark priority (A-Z)|
| コンテキストを編集|  | Project Tag |
| プロジェクトを編集|  | Context Tag |
| コピー| `y` or `c` |  |
| フォーカス中のタスクの下部にペースト| `p` |  |
| フォーカス中のタスクの上部にペースト| `P` |  |
| 締切日を編集| E |  due:|
| 詳細を編集する（編集モード切り替え）| E |  detail: |

### **format**

```text
[Completion mark] [Priolity mark] [Completion date] [Creation Date] [Todo text] [Project tag] [Context tag] [Due date] [Todo detail text]
```

### **example**

```text
x (A) 2024-02-01 2024-01-01 go to home +Private @shopping due:2024-02-01 detail:buy new item. \n ・oops
```

### **code format**

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
