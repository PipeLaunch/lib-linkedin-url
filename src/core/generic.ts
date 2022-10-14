import { TLD_TABLE } from "./../utils/tld";

export function extractLinkedInSubdomain(url: string): string {
  if (typeof url !== "string" || !url) {
    return "";
  }

  url = url.toLowerCase();
  const regex = /(?:^https:\/\/)(..)(?:\.linkedin\.com\/)/i;
  const match = url.match(regex);

  if (match && match.length === 2) {
    return match[1] ?? "";
  }

  return "";
}

export function extractCountryName(url: string): string {
  if (typeof url !== "string" || !url) {
    return "";
  }

  const tld = extractLinkedInSubdomain(url);
  if (!tld) {
    return "";
  }

  const find = TLD_TABLE.find((item) => item.t === tld);
  if (find) {
    return find.c;
  }

  return "";
}
