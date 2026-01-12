import { useLayoutEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Code from "@editorjs/code";

interface EditorComponentProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export function EditorComponent({
  data,
  onChange,
  readOnly = false,
  placeholder = "Start writing...",
}: EditorComponentProps) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);
  const editorId = useRef(`editorjs-${Date.now()}`);

  useLayoutEffect(() => {
    if (!holderRef.current) return;

    // Clear previous content
    holderRef.current.innerHTML = "";

    const editor = new EditorJS({
      holder: editorId.current, // <-- Important: use the string ID
      data: data?.blocks?.length ? data : undefined,
      readOnly,
      placeholder,
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: "Enter a header",
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2,
          },
        },
        paragraph: { class: Paragraph, inlineToolbar: true },
        list: { class: List, inlineToolbar: true },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: "Enter a quote",
            captionPlaceholder: "Quote's author",
          },
        },
        code: {
          class: Code,
          config: {
            placeholder: "Enter code",
          },
        },
      },
      onChange: async () => {
        if (!editorRef.current || !onChange) return;
        try {
          const savedData = await editorRef.current.save();
          onChange(savedData);
        } catch (err) {
          console.error("Failed to save editor data:", err);
        }
      },
    });

    editorRef.current = editor;

    return () => {
      const instance = editorRef.current;
      if (instance && typeof instance.destroy === "function") {
        instance.destroy();
      }
      editorRef.current = null;

      if (holderRef.current) {
        holderRef.current.innerHTML = "";
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (!editorRef.current) return;
    try {
      (editorRef.current as any).readOnly = readOnly;
    } catch (err) {
      console.warn("Failed to toggle readOnly:", err);
    }
  }, [readOnly]);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Content *
      </label>
      <div className="editor-wrapper rounded-lg border p-4">
        <div id={editorId.current} ref={holderRef} className="prose" />
      </div>
    </div>
  );
}
