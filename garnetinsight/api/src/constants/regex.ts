export const ARG_IN_QUOTATION_MARKS_REGEX = /"[^"]*|'[^']*'|"+/g;
export const IS_INTEGER_NUMBER_REGEX = /^\d+$/;
export const IS_NUMBER_REGEX = /^-?\d*(\.\d+)?$/;
export const IS_NON_PRINTABLE_ASCII_CHARACTER = /[^ -~\u0007\b\t\n\r]/;
export const IP_ADDRESS_REGEX =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
export const PRIVATE_IP_ADDRESS_REGEX =
  /(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/;
export const IS_TIMESTAMP = /^(\d{10}|\d{13}|\d{16}|\d{19})$/;
