import { addHttpsIfMissing, cleanUrl } from "../utils/urls";
import { extractLinkedInSubdomain } from "./generic";

export function isValidCompanyLinkedInProfileUrl(url: string): boolean {
  if (typeof url !== "string" || !url) {
    return false;
  }

  url = addHttpsIfMissing(url);

  const regex =
    /^https?:\/\/((www|\w\w)\.)?linkedin\.com\/(company|school)\/[%\p{L}0-9-]+\/?/giu;

  const validLinkedInProfileUrl = url.match(regex) !== null;

  return validLinkedInProfileUrl;
}

export function isValidSchoolLinkedInProfileUrl(url: string): boolean {
  if (typeof url !== "string" || !url) {
    return false;
  }

  url = addHttpsIfMissing(url);

  const regex =
    /^https?:\/\/((www|\w\w)\.)?linkedin\.com\/school\/[%\p{L}0-9-]+\/?/iu;
  const validLinkedInProfileUrl = url.match(regex) !== null;

  return validLinkedInProfileUrl;
}

export function extractCompanyLinkedInProfileName(
  linkedInProfileUrl = ""
): string {
  if (!isValidCompanyLinkedInProfileUrl(linkedInProfileUrl)) {
    return "";
  }

  linkedInProfileUrl = addHttpsIfMissing(linkedInProfileUrl);

  const regex =
    /^https?:\/\/((www|\w\w)\.)?linkedin\.com\/(company|school)\//gi;

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

  if (!linkedInProfileName) {
    return "";
  }

  if (options.keepTld) {
    const extractedDomain = extractLinkedInSubdomain(linkedInProfileUrl);
    const tld = extractedDomain ? extractedDomain : "www";

    return `https://${tld}.linkedin.com/company/${linkedInProfileName}`;
  }

  return `https://linkedin.com/company/${linkedInProfileName}`;
}
