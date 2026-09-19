/**
 * Serialisation helpers for the command log panel.
 *
 * Commands recorded here are replayed in the UI for learning purposes, so the
 * output must be:
 *  - safe: binary payloads and huge values must never be forwarded verbatim,
 *  - bounded: a single entry must stay small no matter how large the value is,
 *  - lossless enough: the command name and its arguments stay readable.
 *
 * These helpers are intentionally dependency free (no imports from the redis
 * client layer) so they can be used from the client classes without creating
 * an import cycle.
 */

/** Max characters kept for a single command line before truncating. */
export const MAX_COMMAND_LINE_LENGTH = 200;

/** Max number of commands reported for one pipeline / batch. */
export const MAX_PIPELINE_COMMANDS = 50;

/** Placeholder used for values that are too large to be useful in a log. */
export const MAX_ARGUMENT_LENGTH = 120;

export interface SerializedCommand {
  /** Command name, upper cased, e.g. `HSET`. */
  command: string;
  /** Serialised arguments, already truncated / redacted. */
  args: string[];
  /** Full one line representation, e.g. `HSET user:1 name Alice`. */
  commandLine: string;
  /** True when the command line was shortened to fit the log. */
  truncated: boolean;
}

/**
 * True when a string only holds characters that are safe to print.
 *
 * Command arguments are echoed into a log panel, so control characters mean
 * the payload is binary data rather than text.
 */
const isPrintableText = (value: string): boolean =>
  Array.from(value).every((char) => {
    const code = char.codePointAt(0) ?? 0;

    // tab, newline and carriage return are printable enough for a log line
    return (
      code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127)
    );
  });

/**
 * Decodes a buffer as UTF-8 text, or returns `null` when it is not text.
 *
 * RedisInsight passes every key, field and value as a `Buffer` (see
 * `RedisString`), so replacing buffers with `<binary N bytes>` would hide the
 * most useful part of the command: which key was touched. Only payloads that
 * really are binary keep the size placeholder.
 */
const decodeBufferAsText = (buffer: Buffer): string | null => {
  const decoded = buffer.toString('utf8');

  // `toString('utf8')` substitutes U+FFFD for invalid sequences, which is how
  // a genuine binary payload is told apart from a text one.
  if (decoded.includes('\uFFFD') || !isPrintableText(decoded)) {
    return null;
  }

  return decoded;
};

/**
 * Converts a single command argument into a short, log-safe string.
 * Buffers are decoded when they hold text; binary values fall back to a size
 * placeholder because they are both unreadable and potentially very large.
 */
export const serializeArgument = (arg: unknown): string => {
  let value: string;

  if (Buffer.isBuffer(arg)) {
    const decoded = decodeBufferAsText(arg);

    if (decoded === null) {
      return `<binary ${arg.length} bytes>`;
    }

    value = decoded;
  } else if (arg instanceof Uint8Array) {
    const decoded = decodeBufferAsText(Buffer.from(arg));

    if (decoded === null) {
      return `<binary ${arg.length} bytes>`;
    }

    value = decoded;
  } else if (arg === null || arg === undefined) {
    return '';
  } else if (typeof arg === 'string') {
    value = arg;
  } else if (typeof arg === 'object') {
    try {
      value = JSON.stringify(arg);
    } catch (e) {
      value = String(arg);
    }
  } else {
    value = String(arg);
  }

  if (value.length > MAX_ARGUMENT_LENGTH) {
    return `${value.slice(0, MAX_ARGUMENT_LENGTH)}...(${
      value.length - MAX_ARGUMENT_LENGTH
    } more chars)`;
  }

  return value;
};

/**
 * Serialises a single command (`['hset', 'user:1', 'name', 'Alice']`).
 * A command name may itself contain spaces (`['config get', 'maxmemory']`),
 * which is why it is split before being joined with the arguments.
 */
export const serializeCommand = (command: unknown): SerializedCommand => {
  const parts = Array.isArray(command) ? command : [command];
  const [rawName, ...rawArgs] = parts;

  const nameParts = String(rawName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const args = rawArgs.map(serializeArgument);
  const commandLine = [...nameParts, ...args].join(' ');

  if (commandLine.length <= MAX_COMMAND_LINE_LENGTH) {
    return {
      command: nameParts.join(' ').toUpperCase(),
      args,
      commandLine,
      truncated: false,
    };
  }

  const kept = commandLine.slice(0, MAX_COMMAND_LINE_LENGTH);

  return {
    command: nameParts.join(' ').toUpperCase(),
    args,
    commandLine: `${kept}...(+${
      commandLine.length - MAX_COMMAND_LINE_LENGTH
    } chars)`,
    truncated: true,
  };
};

/**
 * Serialises a batch of commands (pipeline) and caps the number of reported
 * entries so a bulk operation cannot flood the panel.
 */
export const serializeCommands = (
  commands: unknown,
): { entries: SerializedCommand[]; omitted: number } => {
  const list = Array.isArray(commands) ? commands : [commands];

  const reported = list.slice(0, MAX_PIPELINE_COMMANDS);

  return {
    entries: reported.map(serializeCommand),
    omitted: Math.max(list.length - MAX_PIPELINE_COMMANDS, 0),
  };
};
