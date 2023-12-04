import { useCallback, useState } from 'react';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import './Sample.css';

import type { PDFDocumentProxy } from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

const maxWidth = 800;

type PDFFile = string | File | null;

export default function Sample() {
  const [file, setFile] = useState<PDFFile>('./sample.pdf');
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { files } = event.target;

    if (files && files[0]) {
      setFile(files[0] || null);
    }
  }

  function onDocumentLoadSuccess({ numPages: nextNumPages }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
  }

  function onRenderTextLayerSuccess() {
    const textLayerPageNodes = document.querySelectorAll('.textLayer');
    textLayerPageNodes.forEach((pageNode, pageIndex) => {
      const pageFullText = getAllTextFromPage(pageNode)
      const searchText = 'ligula';

      // pageNode.querySelectorAll('span').forEach((textSpan, spanIndex) => {
      //   if(textSpan.textContent?.includes(targetTextString)) {
      //     textSpan.style.backgroundColor = 'rgba(254 240 138 / 0.3)';
      //   }
      // });

      // マッチするテキストが含まれている場合、スタイルを適用
      const searchIndex = pageFullText.indexOf(searchText);
      if (searchIndex !== -1) {
        highlightTextInNode(pageNode, searchIndex, searchText.length);
      }
    });
  }
  function getAllTextFromPage(node:Element) {
    if(!node) {
      return '';
    }
    const spans = node.querySelectorAll('span');
    return Array.from(spans).map(span => span.textContent).join('');
  }
  function highlightTextInNode(node:Element, startIndex:number, length:number) {
    const spans = node.querySelectorAll('span');
    let currentIndex = 0;
  
    spans.forEach(span => {
      if(!span.textContent) {
        return;
      }
      const spanLength = span.textContent.length;
      // マッチするテキストが含まれている場合、スタイルを適用
      if (currentIndex + spanLength > startIndex) {
        // マッチするテキストがこのspan内で終了する場合
        if (currentIndex + spanLength >= startIndex + length) {
          span.style.backgroundColor = 'rgba(254 240 138 / 0.3)';
        } 
        // マッチするテキストがこのspan内で開始する場合
        else if (currentIndex <= startIndex) {
          span.style.backgroundColor = '';
        }
      }
      currentIndex += spanLength;
    });
  }

  return (
    <div className="Example">
      <header>
        <h1>react-pdf sample page</h1>
      </header>
      <div className="Example__container">
        <div className="Example__container__load">
          <label htmlFor="file">Load from file:</label>{' '}
          <input onChange={onFileChange} type="file" />
        </div>
        <div className="Example__container__document" ref={setContainerRef}>
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
                onRenderTextLayerSuccess={onRenderTextLayerSuccess}
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
