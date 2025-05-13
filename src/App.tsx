import { useState, useEffect } from 'react';
import { encode, decode } from 'base65536'; // 실제 base65536 라이브러리 사용을 가정합니다.

import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import CopyLink from './components/CopyLink';

export default function App() {
  const editor = useCreateBlockNote();
  const [, setContentForURL] = useState<string>('');

  useEffect(() => {
    const loadContentFromURL = async () => {
      if (!editor) {
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const encoded = urlParams.get('c');

      console.log("Encoded from URL:", encoded);

      if (encoded) {
        try {
          const decodedBytes = decode(encoded);
          const decodedString = new TextDecoder().decode(decodedBytes);
          console.log("Decoded string:", decodedString);


          const blocks = await editor.tryParseMarkdownToBlocks(decodedString);
          
          editor.replaceBlocks(editor.topLevelBlocks, blocks);
          
          setContentForURL(decodedString);
        } catch (e) {
          console.error("Failed to decode or load content:", e);
          setContentForURL('');
        }
      } else {
        setContentForURL('');
      }
    };

    loadContentFromURL();
  }, [editor]); 

  const handleChange = async () => {
    if (!editor) return;

    const newContentMarkdown = await editor.blocksToMarkdownLossy(editor.topLevelBlocks);
    setContentForURL(newContentMarkdown); // URL 업데이트 및 상태 반영

    const encoder = new TextEncoder();
    const encodedContent = encoder.encode(newContentMarkdown);
    const encodedString = encode(encodedContent); // base65536의 encode 함수

    window.history.replaceState({}, '', `?c=${encodedString}`);
    window.dispatchEvent(new Event("url-changed"));
  };

  return (
      <main className='flex flex-col w-full h-screen'>
        <div className='flex flex-row items-center justify-between w-full p-4 bg-background'>
          <div>
            <h1 className='text-2xl font-bold'>65536.md</h1>
            <p className='text-sm text-gray-500'>A simple markdown editor</p>
          </div>
          <CopyLink />
        </div>
        <div id='editor-container' className='w-full p-4 h-full max-h-screen'>
          <BlockNoteView
            editor={editor}
            onChange={handleChange}
            className='w-full h-full'
          />
        </div>
      </main>
  );
}