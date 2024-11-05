import { removeExpiredRefreshTokens } from '../../src/jobs/auth.jobs'

export const stopCronJobs = () => {
  removeExpiredRefreshTokens.stop()
}

export const startCronJobs = () => {
  removeExpiredRefreshTokens.start()
}
