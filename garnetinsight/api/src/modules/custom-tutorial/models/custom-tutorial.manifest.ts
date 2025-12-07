import { CustomTutorialActions } from 'src/modules/custom-tutorial/models/custom-tutorial';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum CustomTutorialManifestType {
  CodeButton = 'code-button',
  Group = 'group',
  InternalLink = 'internal-link',
}

export interface ICustomTutorialManifest {
  id: string;
  type: CustomTutorialManifestType;
  label: string;
  children?: Record<string, ICustomTutorialManifest>;
  args?: Record<string, any>;
  _actions?: CustomTutorialActions[];
  _path?: string;
}

export class CustomTutorialManifestArgs {
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Expose()
  @IsString()
  @IsNotEmpty()
  path?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Expose()
  @IsBoolean()
  initialIsOpen?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Expose()
  @IsBoolean()
  withBorder?: boolean;
}

export class CustomTutorialManifest {
  @ApiProperty({ type: String })
  @Expose()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ enum: CustomTutorialManifestType })
  @Expose()
  @IsEnum(CustomTutorialManifestType, {
    message: `type must be a valid enum value. Valid values: ${Object.values(
      CustomTutorialManifestType,
    )}.`,
  })
  type: CustomTutorialManifestType;

  @ApiProperty({ type: String })
  @Expose()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @Expose()
  @IsString()
  @IsNotEmpty()
  summary?: string;

  @ApiPropertyOptional({ type: CustomTutorialManifestArgs })
  @IsOptional()
  @Expose()
  @ValidateNested()
  @Type(() => CustomTutorialManifestArgs)
  args?: CustomTutorialManifestArgs;

  @ApiPropertyOptional({ type: CustomTutorialManifest })
  @IsOptional()
  @Expose()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => CustomTutorialManifest)
  children?: CustomTutorialManifest[];
}

export class RootCustomTutorialManifest extends CustomTutorialManifest {
  @ApiPropertyOptional({ enum: CustomTutorialActions })
  @IsOptional()
  @Expose()
  @IsArray()
  @IsEnum(CustomTutorialActions, { each: true })
  _actions?: CustomTutorialActions[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Expose()
  @IsString()
  @IsNotEmpty()
  _path?: string;

  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Expose()
  @IsString()
  @IsNotEmpty()
  author?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Expose()
  @IsString()
  @IsNotEmpty()
  url?: string;

  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  industry?: string[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Expose()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
