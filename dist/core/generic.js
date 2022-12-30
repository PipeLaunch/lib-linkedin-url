"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCountryName = exports.extractLinkedInSubdomain = void 0;
const tld_1 = require("./../utils/tld");
/**
 * @description Extracts linkedin subdomain from linkedin url
 * @param url {string} url to extract linkedin subdomain from
 * @returns {string} linkedin subdomain
 */
function extractLinkedInSubdomain(url) {
    var _a;
    if (typeof url !== "string" || !url) {
        return "";
    }
    url = url.toLowerCase();
    const regex = /(?:^http?s:\/\/)(..)(?:\.linkedin\.com\/)/i;
    const match = url.match(regex);
    if (match && match.length === 2) {
        return (_a = match[1]) !== null && _a !== void 0 ? _a : "";
    }
    return "";
}
exports.extractLinkedInSubdomain = extractLinkedInSubdomain;
/**
 * @description Extracts country name from linkedin url
 * @note default or unknown country is "United States"
 * @param url {string} url to extract country name from
 * @returns {string} country name in english
 */
function extractCountryName(url) {
    if (typeof url !== "string" || !url) {
        return "";
    }
    const tld = extractLinkedInSubdomain(url);
    if (!tld) {
        return "";
    }
    const find = tld_1.TLD_TABLE.find((item) => item.t === tld);
    if (find) {
        return find.c;
    }
    return "";
}
exports.extractCountryName = extractCountryName;
//# sourceMappingURL=generic.js.map