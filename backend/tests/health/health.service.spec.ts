import { HealthService } from '../../src/health/health.service.js'

describe('HealthService', () => {
  it('getHealth_always_returnsOk', () => {
    const service = new HealthService()

    expect(service.getHealth()).toEqual({ status: 'ok' })
  })
})
