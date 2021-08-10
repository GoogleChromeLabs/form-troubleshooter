export interface ImageInfo {
  src: string;
  width: number;
  height: number;
}

export function getImageInfo(src: string): Promise<ImageInfo> {
  const image = document.createElement('img');
  image.setAttribute('src', src);

  return new Promise((resolve, reject) => {
    image.onload = () => {
      resolve({
        src: image.src,
        width: image.width,
        height: image.height,
      });
    };

    image.onerror = e => {
      reject(e);
    };
  });
}
