/**
 * @description validate linkedin profile url
 * @param url linkedin url
 * @param numeric enable to validate also profiles like http://nl.linkedin.com/pub/other-name/11/223/544
 * @returns {Boolean} true if url is a valid linkedin url
 */
export declare function isValidLinkedInProfileUrl(url: string, options?: {
    numeric?: boolean;
}): boolean;
/**
 * @description Extracts the name of the linkedin profile from the url
 * @param {String} linkedInProfileUrl
 * @returns {String} linkedin profile name
 */
export declare function extractLinkedInProfileName(linkedInProfileUrl: string): string;
export declare function generateCanonicalLinkedInProfileUrl(linkedInProfileUrl: string, options?: {
    keepTld?: boolean;
}): string;
//# sourceMappingURL=personProfiles.d.ts.map