export function addHttpsIfMissing(url: string): string {
  if (typeof url !== "string" || !url) {
    return "";
  }

  const regex = /^https?:\/\//gi;
  if (url.match(regex)) {
    return url;
  }

  return `https://${url}`;
}

export function cleanUrl(url: string): string {
  if (typeof url !== "string" || !url) {
    return "";
  }

  const clean = url
    .replace(/\?.*$/, "") // get parameter
    .replace(/\/.*$/, "") // replace everything after the slash
    .replace(/#.*$/, ""); // any end #

  return clean.toString();
}
