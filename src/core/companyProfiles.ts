import { addHttpsIfMissing, cleanUrl } from "../utils/urls";
import { extractLinkedInSubdomain } from "./generic";

export function isValidCompanyLinkedInProfileUrl(url: string): boolean {
  if (typeof url !== "string" || !url) {
    return false;
  }

  url = addHttpsIfMissing(url);

  const regex =
    /^https?:\/\/((www|\w\w)\.)?linkedin\.com\/company\/(\w+|\d+|%[0-9A-Fa-f]{2}|([\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d])+)/gi;

  const validLinkedInProfileUrl = url.match(regex) !== null;

  return validLinkedInProfileUrl;
}

export function extractCompanyLinkedInProfileName(linkedInProfileUrl = "") {
  if (!isValidCompanyLinkedInProfileUrl(linkedInProfileUrl)) return "";

  linkedInProfileUrl = addHttpsIfMissing(linkedInProfileUrl);

  const regex = /^https?:\/\/((www|\w\w)\.)?linkedin\.com\/company\//gi;

  let linkedInProfile = linkedInProfileUrl.replace(regex, "");
  linkedInProfile = cleanUrl(linkedInProfile);

  return linkedInProfile;
}

export function generateCanonicalCompanyLinkedInProfileUrl(
  linkedInProfileUrl: string,
  options: { keepTld?: boolean } = {}
): string {
  const linkedInProfileName =
    extractCompanyLinkedInProfileName(linkedInProfileUrl).toLowerCase();

  if (!linkedInProfileName) return "";

  if (options.keepTld) {
    const extractedDomain = extractLinkedInSubdomain(linkedInProfileUrl);
    const tld = extractedDomain ? extractedDomain : "www";

    return `https://${tld}.linkedin.com/company/${linkedInProfileName}`;
  }

  return `https://linkedin.com/company/${linkedInProfileName}`;
}
