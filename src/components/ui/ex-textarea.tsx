import React, { useState, useRef, useEffect, useCallback } from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";
import { TodoProps } from "@/types";
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode, EditorState } from 'lexical';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { AutoLinkPlugin, createLinkMatcherWithRegExp } from '@lexical/react/LexicalAutoLinkPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { LinkNode, AutoLinkNode } from '@lexical/link';

// URLマッチャーを定数として外部化
const URL_MATCHER = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

// EditorConfigの型定義
interface EditorConfig {
    namespace: string;
    onError: (error: Error) => void;
    nodes: Array<any>;
    editable: boolean;
}

export const ExTextarea = ({
    t,
    setValue,
    mode,
    prefix,
    register
}: {
    t: TodoProps;
    setValue: (name: string, value: string) => void;
    mode: string;
    prefix: string;
    register: UseFormRegister<FieldValues>;
}) => {
    const initialConfig: EditorConfig = {
        namespace: `editor-${t.id}`,
        onError: (error: Error) => {
            console.error('Editor Error:', error);
            // エラー処理を追加
        },
        nodes: [LinkNode, AutoLinkNode],
        editable: mode === "editDetail" && prefix === "detail",
    };

    const [content, setContent] = useState(t.detail ?? "");

    useEffect(() => {
        setValue(`edit-content-detail-${t.id}`, t.detail ?? "")
        setContent(t.detail ?? "")
    }, [t, setValue])

    const handleChange = (editorState: EditorState) => {
        editorState.read(() => {
            const root = $getRoot();
            const text = root.getTextContent();
            setContent(text);
            setValue(`edit-content-detail-${t.id}`, text);
        });
    };

    return (
        <>
            <input type="hidden" {...register(`edit-content-detail-${t.id}`, { value: content })} />
            <div className="relative w-full h-full">
                <LexicalComposer initialConfig={initialConfig}>
                    <div
                        className="relative w-full h-full editor-container cursor-text
                            [&_a]:text-blue-600 
                            [&_a]:underline 
                            [&_a]:cursor-pointer 
                            [&_a]:inline-flex
                            [&_a]:items-center
                            [&_a]:gap-0.5
                            [&[data-editable='false']_a]:pointer-events-auto 
                            [&[data-editable='true']_a]:pointer-events-none
                            [&[data-editable='true']_a]:text-card-foreground
                            [&[data-editable='true']_a]:no-underline
                            "
                        data-editable={mode === "editDetail" && prefix === "detail"}
                    >
                        {!content &&
                            <span className="absolute top-2 left-4 text-muted-foreground pointer-events-none">
                                詳細なメモを入力…
                            </span>
                        }
                        <PlainTextPlugin
                            contentEditable={
                                <ContentEditable
                                    className="w-full border-none outline-none px-4 py-2 whitespace-pre-wrap break-words min-h-[130px] overflow-y-auto"
                                    readOnly={!(mode === "editDetail" && prefix === "detail")}
                                />
                            }
                            placeholder={null}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <OnChangePlugin onChange={handleChange} />
                        <HistoryPlugin />
                        <AutoLinkPlugin
                            matchers={[
                                (text: string) => {
                                    const match = createLinkMatcherWithRegExp(URL_MATCHER)(text);
                                    if (match === null) return null;
                                    return {
                                        ...match,
                                        attributes: {
                                            target: '_blank',
                                            rel: 'noopener noreferrer'
                                        }
                                    };
                                }
                            ]}
                        />
                        <LinkClickPlugin />
                        <AutoFocusPlugin mode={mode} prefix={prefix} />
                        <InitialContentPlugin content={t.detail} />
                    </div>
                </LexicalComposer>
            </div>
        </>
    );
};

// カスタムプラグイン: 自動フォーカス
function AutoFocusPlugin({ mode, prefix }: { mode: string, prefix: string }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        // エディタの編集可能状態を更新
        editor.setEditable(mode === "editDetail" && prefix === "detail");
        if (mode === "editDetail" && prefix === "detail") {
            editor.focus();
        }
    }, [editor, mode, prefix]);

    return null;
}

// カスタムプラグイン: 初期コンテンツの設定
function InitialContentPlugin({ content }: { content?: string }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.update(() => {
            const root = $getRoot();
            const paragraph = $createParagraphNode();
            if (content) {
                paragraph.append($createTextNode(content));
            }
            // 既存のコンテンツをクリアして新しいコンテンツを設定
            root.clear();
            root.append(paragraph);
        });
    }, [editor, content]); // contentの変更を監視

    return null;
}

// 新しいカスタムプラグインを追加
function LinkClickPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const removeListener = editor.registerRootListener(
            (rootElement: HTMLElement | null) => {
                if (rootElement) {
                    rootElement.addEventListener('mousedown', (e) => {
                        const target = e.target as HTMLElement;
                        const linkElement = target.tagName === 'A' ?
                            target : target.closest('a');

                        // 編集可能な状態の場合は、リンククリックの処理をスキップ
                        if (linkElement && !editor.isEditable()) {
                            e.stopPropagation(); 
                            e.preventDefault();  
                            window.open((linkElement as HTMLAnchorElement).href, '_blank', 'noopener,noreferrer');
                        }
                    });
                }
            }
        );
        return removeListener;
    }, [editor]);

    return null;
}
