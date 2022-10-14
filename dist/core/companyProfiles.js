"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCanonicalCompanyLinkedInProfileUrl = exports.extractCompanyLinkedInProfileName = exports.isValidCompanyLinkedInProfileUrl = void 0;
const urls_1 = require("../utils/urls");
const generic_1 = require("./generic");
function isValidCompanyLinkedInProfileUrl(url) {
    if (typeof url !== "string" || !url) {
        return false;
    }
    url = (0, urls_1.addHttpsIfMissing)(url);
    const regex = /^https?:\/\/((www|\w\w)\.)?linkedin.com\/company\/(\w|\d)/gi;
    const validLinkedInProfileUrl = url.match(regex) !== null;
    return validLinkedInProfileUrl;
}
exports.isValidCompanyLinkedInProfileUrl = isValidCompanyLinkedInProfileUrl;
function extractCompanyLinkedInProfileName(linkedInProfileUrl = "") {
    if (!isValidCompanyLinkedInProfileUrl(linkedInProfileUrl))
        return "";
    linkedInProfileUrl = (0, urls_1.addHttpsIfMissing)(linkedInProfileUrl);
    const regex = /^https?:\/\/((www|\w\w)\.)?linkedin\.com\/company\//gi;
    let linkedInProfile = linkedInProfileUrl.replace(regex, "");
    linkedInProfile = (0, urls_1.cleanUrl)(linkedInProfile);
    return linkedInProfile;
}
exports.extractCompanyLinkedInProfileName = extractCompanyLinkedInProfileName;
function generateCanonicalCompanyLinkedInProfileUrl(linkedInProfileUrl, options = {}) {
    const linkedInProfileName = extractCompanyLinkedInProfileName(linkedInProfileUrl).toLowerCase();
    if (!linkedInProfileName)
        return "";
    if (options.keepTld) {
        const extractedDomain = (0, generic_1.extractLinkedInSubdomain)(linkedInProfileUrl);
        const tld = extractedDomain ? extractedDomain : "www";
        return `https://${tld}.linkedin.com/company/${linkedInProfileName}`;
    }
    return `https://linkedin.com/company/${linkedInProfileName}`;
}
exports.generateCanonicalCompanyLinkedInProfileUrl = generateCanonicalCompanyLinkedInProfileUrl;
//# sourceMappingURL=companyProfiles.js.map