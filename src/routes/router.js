/**
 * The routes.
 *
 * @author Martin Henriksson
 */

import express from 'express'
import createError from 'http-errors'
import { router as authRouter } from './auth-router.js'

export const router = express.Router()

router.use('/', authRouter)

router.use('*', (req, res, next) => next(createError(404)))
