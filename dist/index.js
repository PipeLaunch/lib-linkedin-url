'use strict';

// src/internal/patterns.ts
var HOST_PREFIX = String.raw`^https?:\/\/(?:(?:www|[a-z]{2})\.)?linkedin\.com\/`;
var PCT = String.raw`%[0-9a-f]{2}`;
var SLUG = String.raw`(?:${PCT}|[\p{L}0-9])(?:${PCT}|[\p{L}0-9&'._-])*`;
var AFTER_SLUG = String.raw`(?=[/?#]|$)`;
var PERSON_RE = new RegExp(
  String.raw`${HOST_PREFIX}(?:mwlite\/|m\/)?(in)\/(${SLUG})${AFTER_SLUG}`,
  "iu"
);
var COMPANY_RE = new RegExp(
  String.raw`${HOST_PREFIX}(company|school)\/(${SLUG})${AFTER_SLUG}`,
  "iu"
);
var SCHOOL_RE = new RegExp(
  String.raw`${HOST_PREFIX}(school)\/(${SLUG})${AFTER_SLUG}`,
  "iu"
);
var PUB_RE = new RegExp(
  String.raw`${HOST_PREFIX}pub\/(${SLUG})((?:\/[a-z0-9]+){3})${AFTER_SLUG}`,
  "iu"
);
var SUBDOMAIN_RE = /^https?:\/\/([a-z]{2})\.linkedin\.com(?=[/?#]|$)/i;
var HAS_PROTOCOL_RE = /^https?:\/\//i;

// src/internal/util.ts
function isNonEmptyString(value) {
  return typeof value === "string" && value !== "";
}
function addHttpsIfMissing(url) {
  if (!isNonEmptyString(url)) return "";
  return HAS_PROTOCOL_RE.test(url) ? url : `https://${url}`;
}
function extractSubdomain(url) {
  if (!isNonEmptyString(url)) return "";
  const match = SUBDOMAIN_RE.exec(addHttpsIfMissing(url));
  return match?.[1]?.toLowerCase() ?? "";
}

// src/internal/entity.ts
var ENTITY_RE = {
  person: PERSON_RE,
  // The company matcher accepts /school/ URLs as well (long-standing behavior).
  company: COMPANY_RE,
  school: SCHOOL_RE
};
function matchEntityUrl(url, kind) {
  if (!isNonEmptyString(url)) return null;
  const match = ENTITY_RE[kind].exec(addHttpsIfMissing(url));
  if (!match) return null;
  return {
    segment: (match[1] ?? "").toLowerCase(),
    slug: match[2] ?? ""
  };
}
function matchPubUrl(url) {
  if (!isNonEmptyString(url)) return null;
  const match = PUB_RE.exec(addHttpsIfMissing(url));
  if (!match) return null;
  return { name: match[1] ?? "", ids: match[2] ?? "" };
}
function canonicalHost(url, options) {
  if (!options.keepTld) return "linkedin.com";
  return `${extractSubdomain(url) || "www"}.linkedin.com`;
}
function canonicalEntityUrl(url, kind, options = {}) {
  const match = matchEntityUrl(url, kind);
  if (!match) return "";
  return `https://${canonicalHost(url, options)}/${match.segment}/${match.slug.toLowerCase()}`;
}
function canonicalPubUrl(url, options = {}) {
  const pub = matchPubUrl(url);
  if (!pub) return "";
  return `https://${canonicalHost(url, options)}/pub/${pub.name.toLowerCase()}${pub.ids.toLowerCase()}`;
}

// src/core/personProfiles.ts
function isValidLinkedInProfileUrl(url, options = {}) {
  if (matchEntityUrl(url, "person") !== null) return true;
  return options.numeric === true && matchPubUrl(url) !== null;
}
function extractLinkedInProfileName(url, options = {}) {
  const match = matchEntityUrl(url, "person");
  if (match) return match.slug;
  if (options.numeric === true) return matchPubUrl(url)?.name ?? "";
  return "";
}
function generateCanonicalLinkedInProfileUrl(url, options = {}) {
  const canonical = canonicalEntityUrl(url, "person", options);
  if (canonical) return canonical;
  return options.numeric === true ? canonicalPubUrl(url, options) : "";
}

// src/core/companyProfiles.ts
function isValidCompanyLinkedInProfileUrl(url) {
  return matchEntityUrl(url, "company") !== null;
}
function isValidSchoolLinkedInProfileUrl(url) {
  return matchEntityUrl(url, "school") !== null;
}
function extractCompanyLinkedInProfileName(url = "") {
  return matchEntityUrl(url, "company")?.slug ?? "";
}
function generateCanonicalCompanyLinkedInProfileUrl(url, options = {}) {
  return canonicalEntityUrl(url, "company", options);
}
function generateCanonicalSchoolLinkedInProfileUrl(url, options = {}) {
  return canonicalEntityUrl(url, "school", options);
}

// src/internal/tld.ts
var TLD_TABLE = {
  ac: "Ascension Island",
  ad: "Andorra",
  ae: "United Arab Emirates",
  af: "Afghanistan",
  ag: "Antigua and Barbuda",
  ai: "Anguilla",
  al: "Albania",
  am: "Armenia",
  an: "Netherlands Antilles",
  ao: "Angola",
  aq: "Antarctica",
  ar: "Argentina",
  as: "American Samoa",
  at: "Austria",
  au: "Australia",
  aw: "Aruba",
  ax: "\xC5land Islands",
  az: "Azerbaijan",
  ba: "Bosnia and Herzegovina",
  bb: "Barbados",
  bd: "Bangladesh",
  be: "Belgium",
  bf: "Burkina Faso",
  bg: "Bulgaria",
  bh: "Bahrain",
  bi: "Burundi",
  bj: "Benin",
  bl: "Saint Barth\xE9lemy",
  bm: "Bermuda",
  bn: "Brunei",
  bo: "Bolivia",
  br: "Brazil",
  bs: "Bahamas",
  bt: "Bhutan",
  bv: "Bouvet Island",
  bw: "Botswana",
  by: "Belarus",
  bz: "Belize",
  ca: "Canada",
  cc: "Cocos (Keeling) Islands",
  cd: "Democratic Republic of the Congo",
  cf: "Central African Republic",
  cg: "Republic of the Congo",
  ch: "Switzerland",
  ci: "C\xF4te d'Ivoire",
  ck: "Cook Islands",
  cl: "Chile",
  cm: "Cameroon",
  cn: "People's Republic of China",
  co: "Colombia",
  cr: "Costa Rica",
  cu: "Cuba",
  cv: "Cape Verde",
  cx: "Christmas Island",
  cy: "Cyprus",
  cz: "Czech Republic",
  de: "Germany",
  dj: "Djibouti",
  dk: "Denmark",
  dm: "Dominica",
  do: "Dominican Republic",
  dz: "Algeria",
  ec: "Ecuador",
  ee: "Estonia",
  eg: "Egypt",
  eh: "Western Sahara",
  er: "Eritrea",
  es: "Spain",
  et: "Ethiopia",
  eu: "European Union",
  fi: "Finland",
  fj: "Fiji",
  fk: "Falkland Islands",
  fm: "Federated States of Micronesia",
  fo: "Faroe Islands",
  fr: "France",
  ga: "Gabon",
  gb: "United Kingdom",
  gd: "Grenada",
  ge: "Georgia",
  gf: "French Guiana",
  gg: "Guernsey",
  gh: "Ghana",
  gi: "Gibraltar",
  gl: "Greenland",
  gm: "Gambia",
  gn: "Guinea",
  gp: "Guadeloupe",
  gq: "Equatorial Guinea",
  gr: "Greece",
  gs: "South Georgia and the South Sandwich Islands",
  gt: "Guatemala",
  gu: "Guam",
  gw: "Guinea-Bissau",
  gy: "Guyana",
  hk: "Hong Kong",
  hm: "Heard Island and McDonald Islands",
  hn: "Honduras",
  hr: "Croatia",
  ht: "Haiti",
  hu: "Hungary",
  id: "Indonesia",
  ie: "Ireland",
  il: "Israel",
  im: "Isle of Man",
  in: "India",
  io: "British Indian Ocean Territory",
  iq: "Iraq",
  ir: "Iran",
  is: "Iceland",
  it: "Italy",
  je: "Jersey",
  jm: "Jamaica",
  jo: "Jordan",
  jp: "Japan",
  ke: "Kenya",
  kg: "Kyrgyzstan",
  kh: "Cambodia",
  ki: "Kiribati",
  km: "Comoros",
  kn: "Saint Kitts and Nevis",
  kp: "North Korea",
  kr: "South Korea",
  kw: "Kuwait",
  ky: "Cayman Islands",
  kz: "Kazakhstan",
  la: "Laos",
  lb: "Lebanon",
  lc: "Saint Lucia",
  li: "Liechtenstein",
  lk: "Sri Lanka",
  lr: "Liberia",
  ls: "Lesotho",
  lt: "Lithuania",
  lu: "Luxembourg",
  lv: "Latvia",
  ly: "Libya",
  ma: "Morocco",
  mc: "Monaco",
  md: "Moldova",
  me: "Montenegro",
  mg: "Madagascar",
  mh: "Marshall Islands",
  mk: "Republic of Macedonia",
  ml: "Mali",
  mm: "Myanmar",
  mn: "Mongolia",
  mo: "Macau",
  mp: "Northern Mariana Islands",
  mq: "Martinique",
  mr: "Mauritania",
  ms: "Montserrat",
  mt: "Malta",
  mu: "Mauritius",
  mv: "Maldives",
  mw: "Malawi",
  mx: "Mexico",
  my: "Malaysia",
  mz: "Mozambique",
  na: "Namibia",
  nc: "New Caledonia",
  ne: "Niger",
  nf: "Norfolk Island",
  ng: "Nigeria",
  ni: "Nicaragua",
  nl: "Netherlands",
  no: "Norway",
  np: "Nepal",
  nr: "Nauru",
  nu: "Niue",
  nz: "New Zealand",
  om: "Oman",
  pa: "Panama",
  pe: "Peru",
  pf: "French Polynesia",
  pg: "Papua New Guinea",
  ph: "Philippines",
  pk: "Pakistan",
  pl: "Poland",
  pm: "Saint Pierre and Miquelon",
  pn: "Pitcairn Islands",
  pr: "Puerto Rico",
  ps: "Palestine",
  pt: "Portugal",
  pw: "Palau",
  py: "Paraguay",
  qa: "Qatar",
  re: "R\xE9union",
  ro: "Romania",
  rs: "Serbia",
  ru: "Russia",
  rw: "Rwanda",
  sa: "Saudi Arabia",
  sb: "Solomon Islands",
  sc: "Seychelles",
  sd: "Sudan",
  se: "Sweden",
  sg: "Singapore",
  sh: "Saint Helena",
  si: "Slovenia",
  sj: "Svalbard and Jan Mayen",
  sk: "Slovakia",
  sl: "Sierra Leone",
  sm: "San Marino",
  sn: "Senegal",
  so: "Somalia",
  sr: "Suriname",
  st: "S\xE3o Tom\xE9 and Pr\xEDncipe",
  su: "Soviet Union",
  sv: "El Salvador",
  sy: "Syria",
  sz: "Swaziland",
  tc: "Turks and Caicos Islands",
  td: "Chad",
  tf: "French Southern Territories",
  tg: "Togo",
  th: "Thailand",
  tj: "Tajikistan",
  tk: "Tokelau",
  tl: "East Timor",
  tm: "Turkmenistan",
  tn: "Tunisia",
  to: "Tonga",
  tp: "East Timor",
  tr: "Turkey",
  tt: "Trinidad and Tobago",
  tv: "Tuvalu",
  tw: "Taiwan",
  tz: "Tanzania",
  ua: "Ukraine",
  ug: "Uganda",
  uk: "United Kingdom",
  um: "US Minor Outlying Islands",
  us: "United States",
  uy: "Uruguay",
  uz: "Uzbekistan",
  va: "Vatican City",
  vc: "Saint Vincent and the Grenadines",
  ve: "Venezuela",
  vg: "British Virgin Islands",
  vi: "United States Virgin Islands",
  vn: "Vietnam",
  vu: "Vanuatu",
  wf: "Wallis and Futuna",
  ws: "Samoa",
  ye: "Yemen",
  yt: "Mayotte",
  yu: "Yugoslavia",
  za: "South Africa",
  zm: "Zambia",
  zw: "Zimbabwe"
};

// src/core/generic.ts
function extractLinkedInSubdomain(url) {
  return extractSubdomain(url);
}
function extractCountryName(url) {
  const subdomain = extractSubdomain(url);
  if (!subdomain) return "";
  return TLD_TABLE[subdomain] ?? "";
}

exports.extractCompanyLinkedInProfileName = extractCompanyLinkedInProfileName;
exports.extractCountryName = extractCountryName;
exports.extractLinkedInProfileName = extractLinkedInProfileName;
exports.extractLinkedInSubdomain = extractLinkedInSubdomain;
exports.generateCanonicalCompanyLinkedInProfileUrl = generateCanonicalCompanyLinkedInProfileUrl;
exports.generateCanonicalLinkedInProfileUrl = generateCanonicalLinkedInProfileUrl;
exports.generateCanonicalSchoolLinkedInProfileUrl = generateCanonicalSchoolLinkedInProfileUrl;
exports.isValidCompanyLinkedInProfileUrl = isValidCompanyLinkedInProfileUrl;
exports.isValidLinkedInProfileUrl = isValidLinkedInProfileUrl;
exports.isValidSchoolLinkedInProfileUrl = isValidSchoolLinkedInProfileUrl;
