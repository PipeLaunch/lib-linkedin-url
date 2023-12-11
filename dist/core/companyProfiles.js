"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCanonicalCompanyLinkedInProfileUrl = exports.extractCompanyLinkedInProfileName = exports.isValidSchoolLinkedInProfileUrl = exports.isValidCompanyLinkedInProfileUrl = void 0;
const urls_1 = require("../utils/urls");
const generic_1 = require("./generic");
function isValidCompanyLinkedInProfileUrl(url) {
    if (typeof url !== "string" || !url) {
        return false;
    }
    url = (0, urls_1.addHttpsIfMissing)(url);
    const regex = /^https?:\/\/((www|\w\w)\.)?linkedin\.com\/(company|school)\/([a-zA-Z0-9%_\-\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29\ud840-\ud868\udc00-\udfff\ud869\udc00-\uded6\udf00-\udfff\ud86a-\ud86c\udc00-\udfff\ud86d\udc00-\udf34\udf40-\udfff\ud86e\udc00-\udc1d])+$/giu;
    const validLinkedInProfileUrl = url.match(regex) !== null;
    return validLinkedInProfileUrl;
}
exports.isValidCompanyLinkedInProfileUrl = isValidCompanyLinkedInProfileUrl;
function isValidSchoolLinkedInProfileUrl(url) {
    if (typeof url !== "string" || !url) {
        return false;
    }
    url = (0, urls_1.addHttpsIfMissing)(url);
    const regex = /^https?:\/\/((www|\w\w)\.)?linkedin\.com\/school\/(\w+|\d+|%[0-9A-Fa-f]{2}|([\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d])+)/gi;
    const validLinkedInProfileUrl = url.match(regex) !== null;
    return validLinkedInProfileUrl;
}
exports.isValidSchoolLinkedInProfileUrl = isValidSchoolLinkedInProfileUrl;
function extractCompanyLinkedInProfileName(linkedInProfileUrl = "") {
    if (!isValidCompanyLinkedInProfileUrl(linkedInProfileUrl))
        return "";
    linkedInProfileUrl = (0, urls_1.addHttpsIfMissing)(linkedInProfileUrl);
    const regex = /^https?:\/\/((www|\w\w)\.)?linkedin\.com\/(company|school)\//gi;
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