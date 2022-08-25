/**
 * Mongoose model User.
 *
 * @author Martin Henriksson
 */

import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import validator from 'validator'
import crypto from 'crypto'

const { isEmail } = validator

// ---------------------------------
// GETTERS AND SETTERS
// ---------------------------------

/**
 * Set email.
 *
 * @param {string} email - Unencrypted email.
 * @returns {string} - Encrypted email.
 */
function setEmail (email) {
  if (!isEmail(email)) {
    throw new Error('ValidationError')
  }

  email = email.toLowerCase()
  const algorithm = 'aes-256-cbc'
  const initVector = process.env.INIT_VECTOR
  const secutityKey = process.env.SECURITY_KEY

  const cipher = crypto.createCipheriv(algorithm, secutityKey, initVector)
  let encryptedEmail = cipher.update(email, 'utf-8', 'hex')
  encryptedEmail += cipher.final('hex')

  return encryptedEmail
}

/**
 * Decrypts email before delivering.
 *
 * @param {string} encryptedEmail - Encrypted email.
 * @returns {string} - Decrypted email.
 */
function getEmail (encryptedEmail) {
  if (encryptedEmail === 'undefined') {
    throw new Error('Error in decrypt')
  }
  const algorithm = 'aes-256-cbc'
  const initVector = process.env.INIT_VECTOR
  const secutityKey = process.env.SECURITY_KEY

  const decipher = crypto.createDecipheriv(algorithm, secutityKey, initVector)

  let decryptedEmail = decipher.update(encryptedEmail, 'hex', 'utf-8')
  decryptedEmail += decipher.final('utf-8')
  return decryptedEmail
}

// ---------------------------------
// Schema
// ---------------------------------

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [4, 'The usename must be atleast 4 characters.'],
    maxlength: [20, 'The usename must be maximum 20 characters.']
  },
  password: {
    type: String,
    required: true,
    minlength: [10, 'The password must be atleast 10 characters.'],
    maxlength: [300, 'The password must be maximum 300 characters.']
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    set: setEmail,
    get: getEmail,
    lowercase: true,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false,
  toObject: {
    virtuals: true,

    /**
     * Performs a transformation of the resulting object to remove sensitive information.
     *
     * @param {object} doc - The mongoose document which is being converted.
     * @param {object} ret - The plain object representation which has been converted.
     */
    transform: function (doc, ret) {
      delete ret._id
      delete ret.__v
    }
  }
})

// Hash and salt the password.
schema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 8)
})

/**
 * A static method to authenticate the user.
 *
 * @param {*} username - The username.
 * @param {*} password - The password.
 * @returns {object} - The user.
 */
schema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid login attempt.')
  }
  return user
}

export const User = mongoose.model('User', schema)
