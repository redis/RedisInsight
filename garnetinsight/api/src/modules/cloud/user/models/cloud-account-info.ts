import { ApiProperty } from '@nestjs/swagger';

export class CloudAccountInfo {
  @ApiProperty({
    description: 'Account id',
    type: Number,
  })
  accountId: number;

  @ApiProperty({
    description: 'Account name',
    type: String,
  })
  accountName: string;

  @ApiProperty({
    description: 'Account owner name',
    type: String,
  })
  ownerName: string;

  @ApiProperty({
    description: 'Account owner email',
    type: String,
  })
  ownerEmail: string;
}
