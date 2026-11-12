import { Module } from '@nestjs/common'
import pg from 'pg'

export const PG_POOL = 'PG_POOL'

@Module({
  providers: [{ provide: PG_POOL, useFactory: () => new pg.Pool({ connectionString: process.env.DATABASE_URL }) }],
  exports: [PG_POOL],
})
export class DatabaseModule {}
