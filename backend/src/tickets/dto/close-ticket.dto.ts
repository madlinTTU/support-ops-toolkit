import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

export class CloseTicketBody {
  @ApiProperty({ example: 'Reset the password and confirmed that the customer can log in.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  resolution: string
}
