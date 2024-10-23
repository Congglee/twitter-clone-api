import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Twitter Clone API Documentation',
    description: `
      This is the API documentation for the Twitter Clone project. The API provides endpoints for various functionalities similar to Twitter, including user authentication, tweet management, media uploads, and more.

      ## Available Endpoints

      - **auth**: Endpoints for user authentication and authorization.
      - **users**: Endpoints for user profile management, following/unfollowing users, and updating user information.
      - **tweets**: Endpoints for creating, retrieving, and managing tweets.
      - **bookmarks**: Endpoints for bookmarking and unbookmarking tweets.
      - **likes**: Endpoints for liking and unliking tweets.
      - **medias**: Endpoints for uploading and managing media files.
      - **conversations**: Endpoints for managing user conversations.
      - **search**: Endpoints for searching tweets and users.
      - **static**: Endpoints for serving static media files.

      Each endpoint is secured with appropriate middlewares to ensure that only authenticated and authorized users can access them.
    `,
    version: '1.0.0'
  },
  servers: [
    {
      url: 'http://localhost:8000',
      description: 'Local development server'
    }
  ],
  tags: [
    {
      name: 'auth',
      description: 'Endpoints for user authentication and authorization'
    },
    {
      name: 'users',
      description: 'Endpoints for user profile management, following/unfollowing users, and updating user information'
    },
    {
      name: 'tweets',
      description: 'Endpoints for creating, retrieving, and managing tweets'
    },
    {
      name: 'bookmarks',
      description: 'Endpoints for bookmarking and unbookmarking tweets'
    },
    {
      name: 'likes',
      description: 'Endpoints for liking and unliking tweets'
    },
    {
      name: 'medias',
      description: 'Endpoints for uploading and managing media files'
    },
    {
      name: 'conversations',
      description: 'Endpoints for managing user conversations'
    },
    {
      name: 'search',
      description: 'Endpoints for searching tweets and users'
    },
    {
      name: 'static',
      description: 'Endpoints for serving static media files'
    }
  ]
}

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ['src/docs/*.yaml', 'src/routes/*.ts']
}

export const openapiSpecification = swaggerJSDoc(options)
