import { join } from 'node:path'
import type { NestExpressApplication } from '@nestjs/platform-express'
import type { NextFunction, Request, Response } from 'express'

// Shows the built React page from the same server as the API, so one container is enough.
// The page has its own addresses (/stats, /kb-candidates), so any GET that is not an API call returns the page.
export function serveFrontend(app: NestExpressApplication, directory: string): void {
  app.useStaticAssets(directory)
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (request.method !== 'GET' || request.path.startsWith('/api')) {
      next()
      return
    }
    response.sendFile(join(directory, 'index.html'))
  })
}
