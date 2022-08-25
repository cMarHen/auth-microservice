/**
 * Auth routes.
 *
 * @author Martin Henriksson
 */

import express from 'express'
import createError from 'http-errors'
import jwt from 'jsonwebtoken'
import { AuthController } from '../controllers/auth-controller.js'

export const router = express.Router()

const controller = new AuthController()

// --------------------------------------------
// JWT authorization
// --------------------------------------------

/**
 * Authenticates requests.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authenticateJWT = (req, res, next) => {
  try {
    const accessToken = Buffer.from(process.env.ACCESS_TOKEN_PUBLIC, 'base64')
    const [authenticationScheme, token] = req.headers.authorization?.split(' ')

    if (authenticationScheme !== 'Bearer') {
      throw new Error('Invalid authentication scheme.')
    }

    const payload = jwt.verify(token, accessToken)

    req.user = {
      id: payload.id
    }

    next()
  } catch (error) {
    const err = createError(401)
    next(err)
  }
}

// --------------------------------------------
// Routes
// --------------------------------------------

router.post('/login', (req, res, next) => controller.login(req, res, next))
router.post('/register', (req, res, next) => controller.register(req, res, next))
router.patch('/edit', authenticateJWT, (req, res, next) => controller.editPatch(req, res, next))
