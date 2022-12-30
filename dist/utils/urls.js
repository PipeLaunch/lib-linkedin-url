"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUrl = exports.addHttpsIfMissing = void 0;
function addHttpsIfMissing(url) {
    if (typeof url !== "string" || !url) {
        return "";
    }
    const regex = /^https?:\/\//gi;
    if (url.match(regex)) {
        return url;
    }
    return `https://${url}`;
}
exports.addHttpsIfMissing = addHttpsIfMissing;
/**
 * @description Cleans the url from any parameters, slashes and end #
 * @param url {string} url to clean
 * @returns {string} cleaned url
 */
function cleanUrl(url) {
    if (typeof url !== "string" || !url) {
        return "";
    }
    const clean = url
        .replace(/\?.*$/, "") // get parameter
        .replace(/\/.*$/, "") // replace everything after the slash
        .replace(/#.*$/, ""); // any end #
    return clean.toString();
}
exports.cleanUrl = cleanUrl;
//# sourceMappingURL=urls.js.map