import * as li from "./../dist/index.js";

console.log(
  li.isValidCompanyLinkedInProfileUrl(
    "https://www.linkedin.com/company/à-nous-la-lune-"
  )
);

console.log(
  li.extractCompanyLinkedInProfileName(
    "https://www.linkedin.com/company/%C3%A0-nous-la-lune-"
  )
);

console.log(
  li.isValidCompanyLinkedInProfileUrl(
    "https://www.linkedin.com/company/1234567890/"
  )
);
