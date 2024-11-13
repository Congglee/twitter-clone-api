export const logErrorDetails = (response: any) => {
  if (response.status !== 200) {
    console.error('Response body:', response.body)
  }
}
