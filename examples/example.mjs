import { extractCompanyLinkedInProfileName } from "./../dist/index.js";
import * as li from "./../dist/index.js";

console.log(
  extractCompanyLinkedInProfileName(
    "https://www.linkedin.com/company/1234567890/"
  )
);

console.log(
  li.isValidCompanyLinkedInProfileUrl(
    "https://www.linkedin.com/company/1234567890/"
  )
);
