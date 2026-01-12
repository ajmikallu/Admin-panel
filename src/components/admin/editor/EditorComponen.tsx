// src/components/editor/EditorComponenT.tsx
// ============================================================================
// BEST PRACTICE APPROACH using useLayoutEffect
// This prevents double initialization by using a destroyed flag
// ============================================================================

import { useLayoutEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";
// @ts-ignore - No type definitions available
import Header from "@editorjs/header";
// @ts-ignore
import List from "@editorjs/list";
// @ts-ignore
import Paragraph from "@editorjs/paragraph";
// @ts-ignore
import Quote from "@editorjs/quote";
// @ts-ignore
import Code from "@editorjs/code";
// @ts-ignore
import Image from "@editorjs/image";
// @ts-ignore
import Embed from "@editorjs/embed";
// @ts-ignore
import Table from "@editorjs/table";
// @ts-ignore
import Warning from "@editorjs/warning";
// @ts-ignore
import Marker from "@editorjs/marker";
// @ts-ignore
import InlineCode from "@editorjs/inline-code";
// @ts-ignore
import Delimiter from "@editorjs/delimiter";
// @ts-ignore
import LinkTool from "@editorjs/link";

interface EditorComponentProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export const EditorComponen = ({
  data,
  onChange,
  readOnly = false,
  placeholder = "Start writing your blog post...",
}: EditorComponentProps) => {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);
  const editorId = useRef(`editorjs-${Date.now()}`);

  // ============================================================================
  // useLayoutEffect - Runs synchronously before browser paint
  // This prevents the double editor issue in React Strict Mode
  // ============================================================================
  useLayoutEffect(() => {
    // Flag to track if component was unmounted during async initialization
    let destroyed = false;

    const init = async () => {
      console.log("🚀 Starting editor initialization...");

      // Guard: Don't initialize if already exists or no DOM element
      if (editorRef.current) {
        console.log("⚠️ Editor already exists, skipping...");
        return;
      }

      if (!holderRef.current) {
        console.log("❌ Holder ref not found!");
        return;
      }

      console.log("✅ Holder found:", editorId.current);

      try {
        // Initialize Editor.js
        const editor = new EditorJS({
          holder: editorId.current, // Use string ID instead of ref
          data: data,
          readOnly: readOnly,
          placeholder: placeholder,
          minHeight: 100,

          tools: {
            header: {
              class: Header,
              config: {
                placeholder: "Enter a header",
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2,
              },
              inlineToolbar: true,
            },
            paragraph: {
              class: Paragraph,
              inlineToolbar: true,
            },
            list: {
              class: List,
              inlineToolbar: true,
              config: {
                defaultStyle: "unordered",
              },
            },
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
            image: {
              class: Image,
              config: {
                uploader: {
                  uploadByFile(
                    file: File,
                  ): Promise<{ success: number; file: { url: string } }> {
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        resolve({
                          success: 1,
                          file: {
                            url: e.target?.result as string,
                          },
                        });
                      };
                      reader.onerror = () =>
                        reject(new Error("Failed to read file"));
                      reader.readAsDataURL(file);
                    });
                  },
                  uploadByUrl(
                    url: string,
                  ): Promise<{ success: number; file: { url: string } }> {
                    return Promise.resolve({
                      success: 1,
                      file: {
                        url: url,
                      },
                    });
                  },
                },
              },
            },
            embed: {
              class: Embed,
              config: {
                services: {
                  youtube: true,
                  twitter: true,
                  instagram: true,
                  codepen: true,
                  github: true,
                },
              },
            },
            table: {
              class: Table,
              inlineToolbar: true,
            },
            warning: {
              class: Warning,
              inlineToolbar: true,
              config: {
                titlePlaceholder: "Title",
                messagePlaceholder: "Message",
              },
            },
            marker: {
              class: Marker,
            },
            inlineCode: {
              class: InlineCode,
            },
            delimiter: Delimiter,
            linkTool: {
              class: LinkTool,
              config: {
                endpoint: "/api/fetch-url",
              },
            },
          },

          onChange: async () => {
            if (onChange && editorRef.current) {
              try {
                const savedData = await editorRef.current.save();
                onChange(savedData);
              } catch (error) {
                console.error("Failed to save editor data:", error);
              }
            }
          },
        });

        console.log("⏳ Waiting for editor to be ready...");

        // Wait for editor to be fully ready
        await editor.isReady;

        console.log("✅ Editor is ready!");

        // 🔑 KEY PART: Check if component was unmounted while initializing
        if (destroyed) {
          console.log("⚠️ Component was destroyed during init, cleaning up...");
          // Component unmounted during initialization, clean up immediately
          await editor.destroy();
          return;
        }

        // Component still mounted, store the editor reference
        editorRef.current = editor;
        console.log("✅ Editor reference stored successfully!");
      } catch (error) {
        console.error("❌ Failed to initialize editor:", error);
      }
    };

    init();

    // ============================================================================
    // CLEANUP FUNCTION
    // ============================================================================
    return () => {
      console.log("🧹 Cleanup function called");

      // Mark as destroyed so async init can abort if needed
      destroyed = true;

      // Destroy the editor instance
      if (editorRef.current) {
        console.log("🗑️ Destroying editor...");
        editorRef.current.destroy();
        editorRef.current = null;
      }

      // 🔑 KEY PART: Force DOM cleanup
      // EditorJS is async and may leave DOM elements behind
      if (holderRef.current) {
        console.log("🧹 Clearing DOM...");
        holderRef.current.innerHTML = "";
      }
    };
  }, []); // Empty deps - only run once

  // ============================================================================
  // SECOND EFFECT: Update editor data when prop changes
  // ============================================================================
  useLayoutEffect(() => {
    if (editorRef.current && data) {
      editorRef.current.render(data).catch((error) => {
        console.error("Failed to render editor data:", error);
      });
    }
  }, [data]);

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4">
      <div id={editorId.current} ref={holderRef} className="prose max-w-none" />
    </div>
  );
};

// ============================================================================
// WHY THIS APPROACH WORKS
// ============================================================================
//
// 1. useLayoutEffect vs useEffect
//    - useLayoutEffect runs synchronously BEFORE browser paint
//    - This prevents visual flicker from double mounting
//
// 2. The "destroyed" flag
//    - Tracks if component was unmounted during async init
//    - If unmounted, aborts and cleans up immediately
//    - Prevents storing a reference to a destroyed editor
//
// 3. Force DOM cleanup
//    - holderRef.current.innerHTML = ""
//    - Editor.js is async and may leave DOM behind
//    - This ensures clean slate for next mount
//
// 4. How it handles React Strict Mode:
//    Mount #1:
//      - destroyed = false
//      - Initialize editor
//      - await editor.isReady
//      - Check destroyed flag (false)
//      - Store editor reference
//
//    Unmount #1 (Strict Mode):
//      - destroyed = true
//      - Destroy editor
//      - Clear DOM
//
//    Mount #2:
//      - destroyed = false (new closure)
//      - Initialize new editor
//      - await editor.isReady
//      - Check destroyed flag (false)
//      - Store editor reference
//
// ============================================================================
