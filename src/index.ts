export {
  extractLinkedInProfileName,
  generateCanonicalLinkedInProfileUrl,
  isValidLinkedInProfileUrl,
} from "./core/personProfiles.ts";
export {
  extractCompanyLinkedInProfileName,
  generateCanonicalCompanyLinkedInProfileUrl,
  generateCanonicalSchoolLinkedInProfileUrl,
  isValidCompanyLinkedInProfileUrl,
  isValidSchoolLinkedInProfileUrl,
} from "./core/companyProfiles.ts";
export {
  extractCountryName,
  extractLinkedInSubdomain,
} from "./core/generic.ts";
export type {
  CanonicalPersonProfileUrlOptions,
  CanonicalProfileUrlOptions,
  PersonProfileUrlOptions,
} from "./types.ts";
