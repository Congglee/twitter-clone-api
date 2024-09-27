import { Request, Response } from 'express'
import usersService from '~/services/auth.services'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'congldqn888@gmail.com' && password === '123456') {
    return res.status(200).json({ message: 'Login successful' })
  }
  return res.status(400).json({ message: 'Login failed' })
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await usersService.register({ email, password })
    return res.json({ message: 'Register successful', result })
  } catch (error) {
    return res.status(400).json({ message: 'Register failed' })
  }
}
