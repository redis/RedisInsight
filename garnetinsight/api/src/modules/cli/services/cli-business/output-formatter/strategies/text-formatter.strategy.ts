import { flattenDeep, isArray, isInteger, isNull, isObject } from 'lodash';
import { IS_NON_PRINTABLE_ASCII_CHARACTER } from 'src/constants';
import { decimalToHexString } from 'src/utils/cli-helper';
import { IOutputFormatterStrategy } from '../output-formatter.interface';

export class TextFormatterStrategy implements IOutputFormatterStrategy {
  public format(reply: any): string {
    let result;
    if (isNull(reply)) {
      result = '(nil)';
    } else if (isInteger(reply)) {
      result = `(integer) ${reply}`;
    } else if (reply instanceof Buffer) {
      result = this.formatRedisBufferReply(reply);
    } else if (isArray(reply)) {
      result = this.formatRedisArrayReply(reply);
    } else if (isObject(reply)) {
      result = this.formatRedisArrayReply(flattenDeep(Object.entries(reply)));
    } else {
      result = reply;
    }
    return result;
  }

  private formatRedisArrayReply(reply: Buffer | Buffer[], level = 0): string {
    let result: string;
    if (isArray(reply)) {
      if (!reply.length) {
        result = '(empty list or set)';
      } else {
        result = reply
          .map((item, index) => {
            const leftMargin = index > 0 ? '   '.repeat(level) : '';
            const lineIndex = `${leftMargin}${index + 1})`;
            const value = this.formatRedisArrayReply(item, level + 1);
            return `${lineIndex} ${value}`;
          })
          .join('\n');
      }
    } else {
      result =
        reply instanceof Buffer
          ? this.formatRedisBufferReply(reply)
          : JSON.stringify(reply);
    }
    return result;
  }

  private formatRedisBufferReply(reply: Buffer): string {
    // Produces an escaped string representation of a byte string.
    // Ported from sdscatrepr() function in sds.c from Redis source code.
    // This is the function redis-cli uses to escape strings for output.
    let result = '"';
    reply.forEach((byte: number) => {
      const char = Buffer.from([byte]).toString();
      if (IS_NON_PRINTABLE_ASCII_CHARACTER.test(char)) {
        result += `\\x${decimalToHexString(byte)}`;
      } else {
        switch (char) {
          case '\\':
            result += `\\${char}`;
            break;
          case '\u0007': // Bell character
            result += '\\a';
            break;
          case '"':
            result += `\\${char}`;
            break;
          case '\b':
            result += '\\b';
            break;
          case '\t':
            result += '\\t';
            break;
          case '\n':
            result += '\\n';
            break;
          case '\r':
            result += '\\r';
            break;
          default:
            result += char;
        }
      }
    });
    result += '"';
    return result;
  }
}
