import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'

@ValidatorConstraint({ name: 'IsValidLoginOrEmail', async: false })
export class IsLoginOrEmail implements ValidatorConstraintInterface {
  validate(value: any) {
    const loginRegex = /^[a-zA-Z0-9_-]{3,15}$/
    const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/

    if (value.length <= 3) {
      return false
    }

    const isValidLogin = loginRegex.test(value) && value.length <= 15
    const isValidEmail = emailRegex.test(value) && value.length <= 50

    return isValidLogin || isValidEmail
  }

  defaultMessage() {
    return 'Incorrect loginOrEmail!'
  }
}
