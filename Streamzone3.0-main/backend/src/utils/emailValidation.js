const GMAIL_DOMAIN_PATTERN = /^[^\s@]+@(gmail\.com|googlemail\.com)$/i;

function isGmailEmail(value) {
  if (typeof value !== 'string') {
    return false;
  }

  return GMAIL_DOMAIN_PATTERN.test(value.trim());
}

module.exports = {
  isGmailEmail,
};
