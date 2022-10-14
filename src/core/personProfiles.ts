import { addHttpsIfMissing, cleanUrl } from "../utils/urls";
import { extractLinkedInSubdomain } from "./generic";

/**
 * @description validate linkedin profile url
 * @param url linkedin url
 * @param numeric enable to validate also profiles like http://nl.linkedin.com/pub/other-name/11/223/544
 * @returns {Boolean} true if url is a valid linkedin url
 */
export function isValidLinkedInProfileUrl(
  url: string,
  options: { numeric?: boolean } = {}
): boolean {
  if (typeof url !== "string" || !url) {
    return false;
  }

  url = addHttpsIfMissing(url);

  const regexNonNumeric =
    /^https?:\/\/((www|\w\w)\.)?linkedin.com\/((in\/[^/]+\/?)|(mwlite\/|m\/)?in\/)/gi;
  const regexNumeric =
    /^https?:\/\/((www|\w\w)\.)?linkedin.com\/((in\/[^/]+\/?)|(pub\/[^/]+\/((\w|\d)+\/?){3})|(mwlite\/|m\/)?in\/)/gi;

  const regex = options.numeric ? regexNumeric : regexNonNumeric;
  const validLinkedInProfileUrl = url.match(regex) !== null;

  return validLinkedInProfileUrl;
}

/**
 * @description Extracts the name of the linkedin profile from the url
 * @param {String} linkedInProfileUrl
 * @returns {String} linkedin profile name
 */
export function extractLinkedInProfileName(linkedInProfileUrl: string) {
  if (!isValidLinkedInProfileUrl(linkedInProfileUrl, { numeric: false }))
    return "";

  linkedInProfileUrl = addHttpsIfMissing(linkedInProfileUrl);

  const regex =
    /^https?:\/\/((www|\w\w)\.)?linkedin\.com\/(in|m\/in|mwlite\/in)\//gi;

  let linkedInProfile = linkedInProfileUrl.replace(regex, "");
  linkedInProfile = cleanUrl(linkedInProfile);

  return linkedInProfile;
}

export function generateCanonicalLinkedInProfileUrl(
  linkedInProfileUrl: string,
  options: { keepTld?: boolean } = {}
): string {
  const linkedInProfileName =
    extractLinkedInProfileName(linkedInProfileUrl).toLowerCase();

  if (!linkedInProfileName) return "";

  if (options.keepTld) {
    const extractedDomain = extractLinkedInSubdomain(linkedInProfileUrl);
    const tld = extractedDomain ? extractedDomain : "www";

    return `https://${tld}.linkedin.com/in/${linkedInProfileName}`;
  }

  return `https://linkedin.com/in/${linkedInProfileName}`;
}
