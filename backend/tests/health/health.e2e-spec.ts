import { Test } from '@nestjs/testing'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import type { App } from 'supertest/types.js'
import { AppModule } from '../../src/app.module.js'

describe('GET /api/health', () => {
  let app: INestApplication<App>

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('getHealth_serverRunning_returnsOk', () => {
    return request(app.getHttpServer()).get('/api/health').expect(200).expect({ status: 'ok' })
  })
})
