"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractLinkedInSubdomain = extractLinkedInSubdomain;
exports.extractCountryName = extractCountryName;
const tld_1 = require("./../utils/tld");
/**
 * @description Extracts linkedin subdomain from linkedin url
 * @param url {string} url to extract linkedin subdomain from
 * @returns {string} linkedin subdomain
 */
function extractLinkedInSubdomain(url) {
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
//# sourceMappingURL=generic.js.map