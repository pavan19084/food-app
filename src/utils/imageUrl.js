export const BASE_IMAGE_URL = "http://31.97.56.234:3000/";

export const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_IMAGE_URL}${path.startsWith("/") ? path.slice(1) : path}`;
};