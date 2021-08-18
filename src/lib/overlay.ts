type OverlayType = 'click' | 'hover';
let clickOverlay: HTMLElement;
let hoverOverlay: HTMLElement;

function getOverlay(type: OverlayType) {
  if (type === 'click') {
    if (!clickOverlay) {
      clickOverlay = document.createElement('div');
      clickOverlay.id = 'form-troubleshooter-highlight-click-overlay';
      document.body.appendChild(clickOverlay);
    }
    return clickOverlay;
  } else {
    if (!hoverOverlay) {
      hoverOverlay = document.createElement('div');
      hoverOverlay.id = 'form-troubleshooter-highlight-hover-overlay';
      document.body.appendChild(hoverOverlay);
    }
    return hoverOverlay;
  }
}

export interface Rectangle {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function getElementRectangle(element: HTMLElement): Rectangle | undefined {
  const rect = element.getBoundingClientRect();

  if (rect) {
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  }
}

const PIXEL_EXPRESSION = /^([-\d.]+)px/;
function getPixelValue(cssUnit: string) {
  const match = PIXEL_EXPRESSION.exec(cssUnit);
  if (match) {
    return Number(match[1]);
  }
  return null;
}

function getBodyOffset() {
  const rect = document.body.getBoundingClientRect();
  const style = window.getComputedStyle(document.body);
  const marginTop = getPixelValue(style.marginTop) ?? 0;
  const marginLeft = getPixelValue(style.marginLeft) ?? 0;

  return {
    top: rect.top - marginTop,
    left: rect.left - marginLeft,
  };
}

export function showOverlay(rect: Rectangle, type: OverlayType, scrollIntoView: boolean): void {
  const overlay = getOverlay(type);

  if (rect) {
    const { top, left, width, height } = rect;

    if (top || left || width || height) {
      const offset = getBodyOffset();
      const overlayTop = top - offset.top;
      const overlayLeft = left - offset.left;
      overlay.style.top = `${overlayTop}px`;
      overlay.style.left = `${overlayLeft}px`;
      overlay.style.width = `${width}px`;
      overlay.style.height = `${height}px`;
      overlay.className = 'in';

      if (scrollIntoView) {
        const isVisible =
          top >= 0 && left >= 0 && top + height <= window.innerHeight && left + width <= window.innerWidth;
        if (!isVisible) {
          const scrollPadding = 50;
          window.scrollTo({
            behavior: 'smooth',
            top: overlayTop - scrollPadding,
            left: overlayLeft - scrollPadding,
          });
        }
      }
    }
  }
}

export function hideOverlay(type: OverlayType): void {
  const overlay = getOverlay(type);
  overlay.className = 'out';
}
