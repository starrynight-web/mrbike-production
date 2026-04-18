"use client";

import { useEffect } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { 
    Bold, 
    Italic, 
    Underline as UnderlineIcon, 
    List, 
    ListOrdered, 
    AlignLeft, 
    AlignCenter, 
    AlignRight,
    Heading1,
    Heading2,
    Link as LinkIcon,
    Undo,
    Redo,
    Code
} from "lucide-react";
import { Button } from "./button";
import { Separator } from "./separator";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-muted/50 border-b rounded-t-lg">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn("h-8 w-8", editor.isActive("bold") && "bg-accent text-accent-foreground")}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn("h-8 w-8", editor.isActive("italic") && "bg-accent text-accent-foreground")}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn("h-8 w-8", editor.isActive("underline") && "bg-accent text-accent-foreground")}
            >
                <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn("h-8 w-8", editor.isActive("code") && "bg-accent text-accent-foreground")}
            >
                <Code className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-8" />

            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn("h-8 w-8", editor.isActive("heading", { level: 1 }) && "bg-accent text-accent-foreground")}
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn("h-8 w-8", editor.isActive("heading", { level: 2 }) && "bg-accent text-accent-foreground")}
            >
                <Heading2 className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-8" />

            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn("h-8 w-8", editor.isActive("bulletList") && "bg-accent text-accent-foreground")}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn("h-8 w-8", editor.isActive("orderedList") && "bg-accent text-accent-foreground")}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-8" />

            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={cn("h-8 w-8", editor.isActive({ textAlign: 'left' }) && "bg-accent text-accent-foreground")}
            >
                <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={cn("h-8 w-8", editor.isActive({ textAlign: 'center' }) && "bg-accent text-accent-foreground")}
            >
                <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={cn("h-8 w-8", editor.isActive({ textAlign: 'right' }) && "bg-accent text-accent-foreground")}
            >
                <AlignRight className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-8" />

            <Button
                variant="ghost"
                size="icon"
                onClick={setLink}
                className={cn("h-8 w-8", editor.isActive("link") && "bg-accent text-accent-foreground")}
            >
                <LinkIcon className="h-4 w-4" />
            </Button>

            <div className="flex-1" />

            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="h-8 w-8"
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="h-8 w-8"
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    );
};

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline cursor-pointer",
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4",
            },
        },
    });

    // Update content if it changes externally
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className={cn("border rounded-lg bg-background", className)}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
