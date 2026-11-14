/**
 * Helper utility for cross-browser, iframe-compatible printing of official documents
 * for Universitas Batanghari (UNBARI) Fakultas Teknik.
 * 
 * Directs output immediately to the user's default operating system printer.
 */

export interface PrintOptions {
  documentTitle?: string;
  orientation?: 'portrait' | 'landscape';
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  usePopupFallback?: boolean;
}

/**
 * Universal print function that sends the formatted document straight to the default printer.
 * Handles iframe restrictions, suppresses background UI, and preserves UNBARI styling.
 */
export function printDocumentElement(
  element: HTMLElement | null,
  options: PrintOptions = {}
): void {
  const { 
    documentTitle = 'Dokumen Resmi FT UNBARI', 
    orientation = 'portrait',
    onBeforePrint, 
    onAfterPrint,
    usePopupFallback = false 
  } = options;

  if (onBeforePrint) onBeforePrint();

  if (!element) {
    window.print();
    if (onAfterPrint) onAfterPrint();
    return;
  }

  const originalDocTitle = document.title;
  document.title = documentTitle;

  // If user requested popup fallback or if in restrictive environment
  if (usePopupFallback) {
    openPrintPopupWindow(element, documentTitle, onAfterPrint);
    return;
  }

  // Inject dynamic @page orientation style if landscape is requested
  const existingOrientStyle = document.getElementById('print-page-orientation');
  if (existingOrientStyle) existingOrientStyle.remove();
  const orientStyle = document.createElement('style');
  orientStyle.id = 'print-page-orientation';
  orientStyle.textContent = `@media print { @page { size: A4 ${orientation}; margin: 1cm; } }`;
  document.head.appendChild(orientStyle);

  // Primary Method: In-DOM print portal
  // Clones the target document into a top-level print portal and sets printing class on body
  let portal = document.getElementById('print-active-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'print-active-portal';
    document.body.appendChild(portal);
  }

  // Preserve element attributes, classes, and styles for identical typography & layout
  portal.className = `print-portal-active font-serif text-slate-900 ${element.className || ''}`;
  portal.style.cssText = element.style.cssText;
  portal.innerHTML = element.innerHTML;
  document.body.classList.add('is-printing-document');

  // Listen for afterprint event
  const cleanup = () => {
    document.body.classList.remove('is-printing-document');
    document.title = originalDocTitle;
    const styleEl = document.getElementById('print-page-orientation');
    if (styleEl) styleEl.remove();
    if (portal && document.body.contains(portal)) {
      portal.innerHTML = '';
      portal.className = '';
      portal.style.cssText = '';
    }
    window.removeEventListener('afterprint', cleanup);
    if (onAfterPrint) onAfterPrint();
  };

  window.addEventListener('afterprint', cleanup);

  // Fallback cleanup timer in case afterprint does not fire in some browsers
  setTimeout(() => {
    if (document.body.classList.contains('is-printing-document')) {
      cleanup();
    }
  }, 4000);

  // Small delay to allow any rendered images/fonts to paint
  requestAnimationFrame(() => {
    setTimeout(() => {
      try {
        window.focus();
        window.print();
      } catch (err) {
        console.warn('Print invocation error:', err);
      }
    }, 150);
  });
}

/**
 * Fallback printer ensuring zero window.open calls to maintain iframe compatibility
 */
export function openPrintPopupWindow(
  element: HTMLElement,
  title: string = 'Dokumen Resmi FT UNBARI',
  onFinish?: () => void
): void {
  try {
    printDocumentElement(element, { documentTitle: title, onAfterPrint: onFinish, usePopupFallback: false });
  } catch (err) {
    console.warn('In-DOM print fallback triggered:', err);
    window.print();
    if (onFinish) onFinish();
  }
}

/**
 * Convenience helper to print by element ID directly to the default OS printer.
 */
export function printDirectToDefaultPrinter(
  elementId: string,
  documentTitle: string = 'Dokumen Resmi FT UNBARI',
  usePopupFallback: boolean = false
): void {
  const el = document.getElementById(elementId);
  printDocumentElement(el, {
    documentTitle,
    usePopupFallback
  });
}

