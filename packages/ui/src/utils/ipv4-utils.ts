/**
 * Predicate that determines whether the provided string represents a valid
 * IPv4 octet.
 *
 * @param str
 * @returns true if argument is valid ipv4 octet
 */
function validIPv4OctetString(str?: string) {
  if (str == null) return false;
  if (str.match(/^[0]+.+/)) return false; // don't allow leading zeros (number constructor does)
  if (!str.match(/^[0-9]{1,3}$/)) return false; //don't allow anything other than numbers

  const n = Number(str);
  return Number.isInteger(n) && n >= 0 && n <= 255;
}

/**
 * Predicate that determines whether the provided string represents a valid
 * IPv4 address.
 *
 * @param str
 * @returns true if argument is valid ipv4 address
 */
function validIPv4String(str?: string) {
  if (str == null) return false;
  const octets = str.split(".");
  return octets.length === 4 && octets.every(validIPv4OctetString);
}

export { validIPv4OctetString, validIPv4String };
