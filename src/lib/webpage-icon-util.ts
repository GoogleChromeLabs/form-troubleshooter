import { getImageInfo, ImageInfo } from './image-info-util';

export async function getWebsiteIcon(document: Document): Promise<ImageInfo | null> {
  const linkElement =
    document.querySelector('link[rel="apple-touch-icon"]') ??
    document.querySelector('link[rel="shortcut icon"]') ??
    document.querySelector('link[rel="icon"]');

  if (linkElement) {
    const href = linkElement.getAttribute('href');

    if (href) {
      return await getImageInfo(href);
    }
  }

  return null;
}
