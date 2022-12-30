"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCanonicalLinkedInProfileUrl = exports.extractLinkedInProfileName = exports.isValidLinkedInProfileUrl = void 0;
const urls_1 = require("../utils/urls");
const generic_1 = require("./generic");
/**
 * @description validate linkedin profile url
 * @param url linkedin url
 * @param numeric enable to validate also profiles like http://nl.linkedin.com/pub/other-name/11/223/544
 * @returns {Boolean} true if url is a valid linkedin url
 */
function isValidLinkedInProfileUrl(url, options = {}) {
    if (typeof url !== "string" || !url) {
        return false;
    }
    url = (0, urls_1.addHttpsIfMissing)(url);
    const regexNonNumeric = /^https?:\/\/((www|\w\w)\.)?linkedin\.com\/((in\/[^/]+\/?)|(mwlite\/|m\/)?in\/)/gi;
    const regexNumeric = /^https?:\/\/((www|\w\w)\.)?linkedin\.com\/((in\/[^/]+\/?)|(pub\/[^/]+\/((\w|\d)+\/?){3})|(mwlite\/|m\/)?in\/)/gi;
    const regex = options.numeric ? regexNumeric : regexNonNumeric;
    const validLinkedInProfileUrl = url.match(regex) !== null;
    return validLinkedInProfileUrl;
}
exports.isValidLinkedInProfileUrl = isValidLinkedInProfileUrl;
/**
 * @description Extracts the name of the linkedin profile from the url
 * @param {String} linkedInProfileUrl
 * @returns {String} linkedin profile name
 */
function extractLinkedInProfileName(linkedInProfileUrl) {
    if (!isValidLinkedInProfileUrl(linkedInProfileUrl, { numeric: false }))
        return "";
    linkedInProfileUrl = (0, urls_1.addHttpsIfMissing)(linkedInProfileUrl);
    const regex = /^https?:\/\/((www|\w\w)\.)?linkedin\.com\/(in|m\/in|mwlite\/in)\//gi;
    let linkedInProfile = linkedInProfileUrl.replace(regex, "");
    linkedInProfile = (0, urls_1.cleanUrl)(linkedInProfile);
    return linkedInProfile;
}
exports.extractLinkedInProfileName = extractLinkedInProfileName;
function generateCanonicalLinkedInProfileUrl(linkedInProfileUrl, options = {}) {
    const linkedInProfileName = extractLinkedInProfileName(linkedInProfileUrl).toLowerCase();
    if (!linkedInProfileName)
        return "";
    if (options.keepTld) {
        const extractedDomain = (0, generic_1.extractLinkedInSubdomain)(linkedInProfileUrl);
        const tld = extractedDomain ? extractedDomain : "www";
        return `https://${tld}.linkedin.com/in/${linkedInProfileName}`;
    }
    return `https://linkedin.com/in/${linkedInProfileName}`;
}
exports.generateCanonicalLinkedInProfileUrl = generateCanonicalLinkedInProfileUrl;
//# sourceMappingURL=personProfiles.js.map