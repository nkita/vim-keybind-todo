import React, { useState, useRef, useEffect, useCallback } from "react";
import DOMPurify from "dompurify";

type ClickPosition = { x: number; y: number };

const ExTextarea: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(
        "This is an example with a link: https://example.com.\nClick to edit."
    );
    const editableRef = useRef<HTMLDivElement>(null);
    const lastClickPos = useRef<ClickPosition>({ x: 0, y: 0 });

    // URLをリンクに変換する関数
    const convertToLinks = useCallback((text: string): (string | JSX.Element)[] => {
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        return text.split(urlPattern).map((part, index) => {
            if (urlPattern.test(part)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    }, []);

    // キャレット位置を設定する関数
    const setCaretPosition = useCallback((x: number, y: number): void => {
        const range = document.caretRangeFromPoint(x, y);
        if (!range || !editableRef.current) return;

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }, []);

    // クリックイベントハンドラ
    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
        if (!isEditing) {
            const target = e.target as HTMLElement;
            if (target.closest('a')) return; // リンククリック時は編集モードにしない

            lastClickPos.current = { x: e.clientX, y: e.clientY };
            setIsEditing(true);
        }
    }, [isEditing]);

    // 編集モード終了処理
    const exitEditMode = useCallback((): void => {
        if (!editableRef.current) return;

        setIsEditing(false);
        const rawText = editableRef.current.innerText;
        const sanitizedText = DOMPurify.sanitize(rawText); // サニタイズ
        setContent(sanitizedText);
    }, []);

    // 編集モード開始時の処理
    useEffect(() => {
        if (isEditing && editableRef.current) {
            editableRef.current.focus();
            requestAnimationFrame(() => {
                setCaretPosition(lastClickPos.current.x, lastClickPos.current.y);
            });
        }
    }, [isEditing, setCaretPosition]);

    // キーボードイベントハンドラ
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key === 'Escape') exitEditMode();
    }, [exitEditMode]);

    return (
        <div
            ref={editableRef}
            className={`w-full min-h-[150px] border rounded-lg p-4 text-gray-700 whitespace-pre-wrap break-words cursor-text ${isEditing
                ? "border-blue-500 bg-white"
                : "border-gray-300"
                }`}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onClick={handleClick}
            onBlur={exitEditMode}
            onKeyDown={handleKeyDown}
        >
            {isEditing ? content : convertToLinks(content)}
        </div>
    );
};

export default ExTextarea;