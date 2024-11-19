// eslint-disable-next-line no-undef
module.exports = {
  apps: [
    {
      name: 'twitter-clone-api',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'development',
        // If you want to add more environment variables, you can add them here
        // For example:
        // You want to add a variable called `ANOTHER_ENV` with the value `SAMPLE_VALUE`, you can add it like this:
        ANOTHER_ENV: 'SAMPLE_VALUE'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
