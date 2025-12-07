import { ReplyError } from 'src/models';

export class CommandParsingError extends ReplyError {
  constructor(args) {
    super(args);
    this.name = 'CommandParsingError';
  }
}

export class RedirectionParsingError extends ReplyError {
  constructor(args = 'Could not parse redirection error.') {
    super(args);
    this.name = 'RedirectionParsingError';
  }
}

export class CommandNotSupportedError extends ReplyError {
  constructor(args) {
    super(args);
    this.name = 'CommandNotSupportedError';
  }
}

export class WrongDatabaseTypeError extends Error {
  constructor(args) {
    super(args);
    this.name = 'WrongDatabaseTypeError';
  }
}

export class ClusterNodeNotFoundError extends Error {
  constructor(args) {
    super(args);
    this.name = 'ClusterNodeNotFoundError';
  }
}
