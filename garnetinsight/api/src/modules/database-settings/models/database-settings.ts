import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

type TreeViewDelimiterType = {
  label: string;
};

export class DatabaseSettingsData {
  @Expose()
  showHiddenRecommendations?: boolean;

  @Expose()
  notShowConfirmationRunTutorial?: boolean;

  @Expose()
  slowLogDurationUnit?: number;

  @Expose()
  treeViewDelimiter?: TreeViewDelimiterType | TreeViewDelimiterType[];

  @Expose()
  treeViewSort?: string;
}

export class DatabaseSettings {
  @ApiProperty({
    description: 'Database id',
    type: String,
    default: '123',
  })
  @Expose()
  databaseId: string;

  @ApiProperty({
    description: 'Applied settings by user, by database',
  })
  @Expose()
  @Type(() => DatabaseSettingsData)
  data: DatabaseSettingsData;
}
