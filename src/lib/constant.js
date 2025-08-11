export const bannerImages = [
    "rs4.jpeg.jpg",
    "rs2.jpg",
    "Sports-Leisure-1.jpg",
    "rs3.jpg"
]

export function generateRandomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
  }
  return result;
}

