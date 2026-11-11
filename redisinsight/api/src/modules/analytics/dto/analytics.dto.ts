import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

/**
 * Telemetry event names are compile time constants declared in
 * `src/constants/telemetry-events.ts` (api) and `ui/src/telemetry/events.ts` (ui).
 * All of them are SCREAMING_SNAKE_CASE identifiers, so the event name accepted over
 * HTTP is constrained to that shape to keep arbitrary caller supplied strings out of
 * the analytics pipeline.
 */
export const TELEMETRY_EVENT_NAME_PATTERN = /^[A-Z0-9_]{1,128}$/;

/**
 * Page view names are human readable labels declared in `ui/src/telemetry/pageViews.ts`
 * (e.g. "Search and Query", "Pub/Sub"), so they allow letters, digits, spaces and a
 * small set of separators - but still no punctuation that could carry a payload.
 */
export const TELEMETRY_PAGE_NAME_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9 /_-]{0,127}$/;

/**
 * NOTE: `eventData` contents stay free-form on purpose - events carry varied shapes.
 * It must be validated with `@IsObject()` rather than `@ValidateNested()`: the
 * controller runs the pipe with `whitelist: true`, and a nested validation against an
 * untyped plain object makes class-validator reject every key inside it.
 */

export class SendEventDto {
  @ApiProperty({
    description: 'Telemetry event name.',
    type: String,
    example: 'APPLICATION_UPDATED',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Matches(TELEMETRY_EVENT_NAME_PATTERN, {
    message:
      'event must contain only uppercase letters, digits and underscores (128 characters max)',
  })
  event: string;

  @ApiPropertyOptional({
    description: 'Telemetry event data.',
    type: Object,
    example: { length: 5 },
  })
  @IsOptional()
  @IsObject()
  eventData: Object = {};
}

export class SendPageDto {
  @ApiProperty({
    description: 'Telemetry page name.',
    type: String,
    example: 'Browser',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Matches(TELEMETRY_PAGE_NAME_PATTERN, {
    message:
      'event must contain only letters, digits, spaces and the "/", "_", "-" characters (128 characters max)',
  })
  event: string;

  @ApiPropertyOptional({
    description: 'Telemetry event data.',
    type: Object,
    example: { length: 5 },
  })
  @IsOptional()
  @IsObject()
  eventData: Object = {};
}
