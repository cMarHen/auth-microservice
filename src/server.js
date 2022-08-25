/**
 * The start of the application
 *
 * @author Martin Henriksson
 */

import express from 'express'
import helmet from 'helmet'
import logger from 'morgan'
import { router } from './routes/router.js'
import { connectDB } from './config/mongoose.js'

try {
  const app = express()

  await connectDB()

  app.use(helmet())

  app.use(logger('dev'))
  app.use(express.json())
  app.use('/', router)

  // Error handler.
  app.use(function (err, req, res, next) {
    err.status = err.status || 500

    if (req.app.get('env') !== 'development') {
      return res
        .status(err.status)
        .json({
          status: err.status,
          message: err.message
        })
    }

    if (err.status === 400) {
      err.message = 'The request cannot or will not be processed due to something that is perceived to be a client error (for example, validation error).'
    }

    if (err.status === 401) {
      err.message = 'Credentials invalid or not provided.'
    }

    if (err.status === 409) {
      err.message = 'The username and/or email address is already registered.'
    }

    // Development only.
    return res
      .status(err.status)
      .json({
        status: err.status,
        message: err.message,
        cause: err.cause
          ? {
              status: err.cause.status,
              message: err.cause.message,
              stack: err.cause.stack
            }
          : null,
        stack: err.stack
      })
  })

  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (error) {
  console.error(error)
  process.exitCode = 1
}
