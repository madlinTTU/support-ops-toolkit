import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module.js'
import { setupApp } from './app.setup.js'
import { DemoDataService } from './demo/demo-data.service.js'
import { serveFrontend } from './web/serve-frontend.js'

// Works for src/main.ts and for dist/main.js: the .env file is in the folder above both. Variables that are
// already set (for example by Docker) are not overwritten.
const ENV_FILE = fileURLToPath(new URL('../.env', import.meta.url))

async function bootstrap() {
  if (existsSync(ENV_FILE)) {
    process.loadEnvFile(ENV_FILE)
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  setupApp(app)
  if (process.env.FRONTEND_DIR) {
    serveFrontend(app, process.env.FRONTEND_DIR)
  }
  if (process.env.SEED_ON_START === 'true') {
    await app.get(DemoDataService).seedIfEmpty()
  }
  await app.listen(process.env.PORT ?? 3000)
}

await bootstrap()
