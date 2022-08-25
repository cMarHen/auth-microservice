/**
 * Class of type AuthController.
 *
 * @author Martin Henriksson
 */

import jwt from 'jsonwebtoken'
import { User } from '../models/user-model.js'
import createError from 'http-errors'

/**
 * Encapsulate the class.
 */
export class AuthController {
  /**
   * Login.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async login (req, res, next) {
    try {
      const privateKey = Buffer.from(process.env.ACCESS_TOKEN_SECRET, 'base64')

      const user = await User.authenticate(req.body.username, req.body.password)

      const payload = {
        id: user.id
      }

      const accessToken = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: process.env.ACCESS_TOKEN_LIFE
      })

      res
        .status(201)
        .json({
          access_token: accessToken,
          id: user.id
        })
    } catch (error) {
      next(createError(401))
    }
  }

  /**
   * Register.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async register (req, res, next) {
    try {
      const user = new User({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
      })

      await user.save()

      res
        .status(201)
        .json({ id: user.id })
    } catch (error) {
      let err = error
      if (err.code === 11000) {
        // Duplicated keys.
        err = createError(409)
        err.cause = error
      } else if (error.name === 'ValidationError') {
        err = createError(400)
        err.cause = error
      } else {
        err = createError(500)
        err.cause = error
      }

      next(err)
    }
  }

  /**
   * Edit user information.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async editPatch (req, res, next) {
    try {
      await User.findByIdAndUpdate(req.user.id, req.body, { runValidators: true })

      res.status(204).end()
    } catch (error) {
      console.log(error)
      const err = createError(400)
      next(err)
    }
  }
}
