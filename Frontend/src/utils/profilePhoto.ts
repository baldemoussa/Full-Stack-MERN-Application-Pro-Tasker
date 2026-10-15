const AVATAR_SIZE = 256;
const MAX_DATA_URL_LENGTH = 100_000;

export function resizeProfilePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = AVATAR_SIZE;
      canvas.height = AVATAR_SIZE;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that photo."));
        return;
      }

      const scale = Math.max(AVATAR_SIZE / image.width, AVATAR_SIZE / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      context.drawImage(image, (AVATAR_SIZE - width) / 2, (AVATAR_SIZE - height) / 2, width, height);
      URL.revokeObjectURL(url);

      let quality = 0.85;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.4) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }

      if (dataUrl.length > MAX_DATA_URL_LENGTH) {
        reject(new Error("That photo is still too large. Choose a different one."));
        return;
      }

      resolve(dataUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that photo."));
    };

    image.src = url;
  });
}
