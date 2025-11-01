import * as yup from 'yup'

export const emailSchema = yup.string().email('Invalid email address').required('Email is required')

export const passwordSchema = yup
  .string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .required('Password is required')

export const phoneSchema = yup
  .string()
  .matches(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits')
  .required('Phone number is required')

export const nameSchema = yup
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .required('Name is required')

export const urlSchema = yup.string().url('Invalid URL format')

export const requiredStringSchema = yup.string().required('This field is required')

export const optionalStringSchema = yup.string()

