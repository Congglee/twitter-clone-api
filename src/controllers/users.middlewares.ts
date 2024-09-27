import { NextFunction, Request, Response } from 'express'

export const loginController = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (email === 'congldqn888@gmail.com' && password === '123456') {
    return res.status(200).json({ message: 'Login successful' })
  }
  return res.status(400).json({ message: 'Login failed' })
}
