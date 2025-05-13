import { useState, useEffect } from "react";
import { encode, decode } from "base65536";
import pako from "pako";

import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import CopyLink from "./components/CopyLink";

export default function App() {
  const editor = useCreateBlockNote();
  const [, setContentForURL] = useState<string>("");

  useEffect(() => {
    const loadContentFromURL = async () => {
      if (!editor) return;

      const urlParams = new URLSearchParams(window.location.search);
      const encoded = urlParams.get("c");

      if (encoded) {
        try {
          const decodedBytes = decode(encoded);

          let decompressed: Uint8Array;
          try {
            decompressed = pako.ungzip(decodedBytes);
          } catch {
            // 압축 안 되어 있음
            decompressed = decodedBytes;
          }

          const markdown = new TextDecoder().decode(decompressed);
          const blocks = await editor.tryParseMarkdownToBlocks(markdown);
          editor.replaceBlocks(editor.topLevelBlocks, blocks);
          setContentForURL(markdown);
        } catch (e) {
          console.error("Failed to decode or decompress content:", e);
          setContentForURL("");
        }
      } else {
        setContentForURL("");
      }
    };

    loadContentFromURL();
  }, [editor]);

  const handleChange = async () => {
    if (!editor) return;

    const newContentMarkdown = await editor.blocksToMarkdownLossy(
      editor.topLevelBlocks
    );
    setContentForURL(newContentMarkdown);

    const encoder = new TextEncoder();
    let encodedString: string;

    if (newContentMarkdown.length >= 40) {
      const encodedBytes = encoder.encode(newContentMarkdown);
      const compressed = pako.gzip(encodedBytes);
      encodedString = encode(compressed); // 압축 + 인코딩
    } else {
      const plainBytes = encoder.encode(newContentMarkdown);
      encodedString = encode(plainBytes); // 압축 없이 인코딩
    }

    const newUrl = `${window.location.pathname}?c=${encodedString}`;
    window.history.replaceState({}, "", newUrl);
    window.dispatchEvent(new Event("url-changed"));
  };

  return (
    <main className="flex flex-col w-full h-screen">
      <div className="flex flex-row items-center justify-between w-full p-4 bg-background">
        <div>
          <h1 className="text-2xl font-bold">65536.md</h1>
          <p className="text-sm text-muted-foreground">
            A simple markdown editor
          </p>
        </div>
        <CopyLink />
      </div>
      <div id="editor-container" className="w-full p-4 h-full max-h-screen">
        <BlockNoteView
          editor={editor}
          onChange={handleChange}
          className="w-full h-full"
        />
      </div>
    </main>
  );
}
