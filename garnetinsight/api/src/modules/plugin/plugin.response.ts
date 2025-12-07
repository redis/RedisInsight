import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PluginVisualization {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  activationMethod: string;

  @ApiProperty({
    type: String,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  matchCommands: string[];

  @ApiProperty({
    type: Boolean,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  default?: boolean;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  iconDark?: string;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  iconLight?: string;
}

export class Plugin {
  @ApiPropertyOptional({
    description: 'Determine if plugin is built into Garnetinsight',
    type: Boolean,
  })
  internal?: boolean;

  @ApiProperty({
    description: 'Module name from manifest',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Plugins base url',
    type: String,
  })
  baseUrl: string;

  @ApiProperty({
    description: 'Uri to main js file on the local server',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  main: string;

  @ApiProperty({
    description: 'Uri to css file on the local server',
    type: String,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  styles?: string;

  @ApiProperty({
    description: 'Visualization field from manifest',
    type: PluginVisualization,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PluginVisualization)
  visualizations: PluginVisualization[];
}

export class PluginsResponse {
  @ApiProperty({
    description: 'Uri to static resources required for plugins',
    type: String,
  })
  static: string;

  @ApiProperty({
    description: 'List of available plugins',
    type: Plugin,
    isArray: true,
  })
  plugins: Plugin[];
}
