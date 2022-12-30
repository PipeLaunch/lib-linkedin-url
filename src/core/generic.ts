import { TLD_TABLE } from "./../utils/tld";

/**
 * @description Extracts linkedin subdomain from linkedin url
 * @param url {string} url to extract linkedin subdomain from
 * @returns {string} linkedin subdomain
 */
export function extractLinkedInSubdomain(url: string): string {
  if (typeof url !== "string" || !url) {
    return "";
  }

  url = url.toLowerCase();
  const regex = /(?:^http?s:\/\/)(..)(?:\.linkedin\.com\/)/i;
  const match = url.match(regex);

  if (match && match.length === 2) {
    return match[1] ?? "";
  }

  return "";
}

/**
 * @description Extracts country name from linkedin url
 * @note default or unknown country is "United States"
 * @param url {string} url to extract country name from
 * @returns {string} country name in english
 */
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
