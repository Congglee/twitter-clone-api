<div align="center">
  <img src="https://utfs.io/f/B9dfElgKSkF1qd45HuIIeGLrQYsfPXEMO26yuZladRVbHUwc" alt="readme-header"/>
</div>

<!-- 🚨 PROJECT ROADMAP 🚨 -->
<div align="center">
  <h2 style="color: orange; font-size: 2em; margin-bottom: 0.5em;">🚧 <b>Upcoming Major Update</b> 🚧</h2>
  <strong style="font-size: 1.25em;">The project is planned to be migrated from <b>ExpressJS</b> to <b>Fastify</b> for better performance and scalability.<br/>Prisma ORM will also be upgraded to the latest version.<br/>Stay tuned!</strong>
</div>

<div align="center">
  <h1>✨ Welcome to the Twitter Clone API!<br/>NodeJs + Express + Prisma + Typescript ✨</h1>
</div>

<p align="center">
  <span>A full-featured Twitter clone REST API built with TypeScript, featuring authentication, tweet management, media uploads, real-time notifications, social interactions, and comprehensive OpenAPI documentation.</span></br>
  <sub>Made with ❤️ by <a href="https://github.com/Congglee">Conggglee</a></sub>
</p>

<div align="center">

[![NodeJs](https://img.shields.io/badge/node-%3E%3D18.0-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org/ 'Go to NodeJs')
[![NPM](https://img.shields.io/badge/npm-%3E%3D9.0-brightgreen?logo=npm&logoColor=white)](https://www.npmjs.com/ 'Go to NPM')
[![Package - TypeScript](https://img.shields.io/badge/typescript-5.4.5-blue?logo=typescript&logoColor=white)](https://www.npmjs.com/package/typescript 'Go to TypeScript on NPM')
[![Package - Prisma](https://img.shields.io/badge/prisma-latest-blue?logo=prisma&logoColor=white)](https://www.npmjs.com/package/prisma 'Go to Prisma on NPM')
[![Package - Jest](https://img.shields.io/badge/jest-29.7.0-orange?logo=jest)](https://www.npmjs.com/package/jest 'Go to Jest on NPM')

</div>

![divider](https://utfs.io/f/B9dfElgKSkF1OgnmvP9QnWsHAeU0S8jM4g3XItcOhoJlZTzR)

## :blue_heart: About the Project

This project is a comprehensive **Twitter Clone REST API** built with modern technologies and best practices. It's a full-featured backend implementation that mirrors Twitter's core functionalities using **TypeScript** and Express.js. The API is production-ready and includes all essential social media features.<br />

The project leverages cutting-edge technologies including **Prisma ORM** (latest version) for efficient database operations, **AWS S3** for media storage, and **Socket.IO** for real-time notifications. It implements secure user authentication with JWT, email verification, and comprehensive media handling including image processing with **Sharp** and video streaming with HLS.

Key features include:

- User authentication with JWT and email verification
- Tweet management (create, read, update, delete)
- Social interactions (likes, bookmarks, retweets, replies)
- Media uploads (images and video) with AWS S3 integration
- Real-time notifications using Socket.IO
- Advanced search functionality with full-text search
- Comprehensive API documentation using **Swagger/OpenAPI**

The project follows clean architecture principles with thorough input validation, rate limiting for security, và extensive test coverage using **Jest**. Code quality is maintained through **ESLint** and **Prettier** integration.

The API is fully documented, tested, and ready for production deployment.
<br/><br/>

## :rocket: Technologies

[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en/)
[![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)](https://www.fastify.io/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-latest?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/public/assets/images/getting-started)
[![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E)](https://prettier.io/)
[![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Nodemon](https://img.shields.io/badge/NODEMON-%23323330.svg?style=for-the-badge&logo=nodemon&logoColor=%BBDEAD)](https://nodemon.io/)
[![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)
[![Socket.io](https://img.shields.io/badge/socket_io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)](https://swagger.io/)
<br/><br/>

## :zap: Getting Started - Project setup

To install the project, follow the steps below.

### Step 1 - Clone the Git repository

First, to clone the repository, you'll need [Git](https://git-scm.com/downloads) installed on your computer.
From your command line:

```bash
$ git clone https://github.com/Congglee/twitter-clone-api.git
```

### Step 2 - Install the project dependencies

To run this application, you'll need [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. Make sure you install all the necessary dependencies to run the project from your command line:

```bash
$ cd twitter-clone-api
$ npm i
```

### Step 3 - Configure your project variables

In the project folder you will find a `.env.example` file, duplicate it and rename it to `.env` only. The command below will copy the template environment variables file needed to initialize your project.<br />

```bash
$ cp .env.example .env
```

After renaming the file, open it and change the desired variables ​​according to your project:

```.env
#.env
PORT=8000
HOST="http://localhost"
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?sslmode=require&schema=public"
...
```

### Step 4 - Finally, run the project

Running locally in `development` environment:</br>

```bash
# development (watch mode)
$ npm run dev
```

When running locally, by default the API will be accessible at url http://localhost:8000.

Running in a `production` environment (the code will be transpiled in the dist folder and executed):</br>

```bash
# build the project
$ npm run build

# production mode
$ npm run start:prod
```

## :electric_plug: Create your database from ORM

You will need to configure an SQL database supported by the Prisma ORM in order to perform the data storage. By default the boilerplate uses a demo connection to the **PostgreSQL database**, but it can be changed to another database supported by the [Prisma ORM](https://www.prisma.io/stack).

If you want to install another database, remove the Prisma folder, execute a new prisma initialization, follow the instructions and skip this section:

```bash
$ rm .\prisma
$ npx prisma init
```

If you want to continue with the [PostgreSQL](https://www.postgresql.org/download/) database but don't already have the software, download [pgAdmin](https://www.pgadmin.org/download/) now or use a Hosting Cloud Service like [Supabase](https://supabase.io/).

## Initialize your database

You will need to configure a SQL database supported by Prisma ORM for data storage.

Before running the project, it will be necessary to perform a migration through Prisma. In this way, the first tables of the project will be created. When executing the reset command, the ORM seed will be called, thus populating some tables:

Migration run command:

```bash
$ npm run migrate
```

Obs.: Initially, the project assumes that we will use the PostgreSQL database by default, but feel free to change the connection data to the database of your choice.

## :gear: Available .env Settings

| Name   | Description                                             |
| ------ | ------------------------------------------------------- |
| `PORT` | Port number for the server to listen on (default: 8000) |
| `HOST` | Base URL for the server                                 |

### Database Settings

| Name           | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string with connection pooling via pgbouncer |
| `DIRECT_URL`   | Direct PostgreSQL connection string without pooling                |

### JWT Authentication

| Name                               | Description                                   |
| ---------------------------------- | --------------------------------------------- |
| `JWT_SECRET_ACCESS_TOKEN`          | Secret key for signing access tokens          |
| `JWT_SECRET_REFRESH_TOKEN`         | Secret key for signing refresh tokens         |
| `JWT_SECRET_EMAIL_VERIFY_TOKEN`    | Secret key for email verification tokens      |
| `JWT_SECRET_FORGOT_PASSWORD_TOKEN` | Secret key for password reset tokens          |
| `ACCESS_TOKEN_EXPIRES_IN`          | Access token expiration time (1h)             |
| `REFRESH_TOKEN_EXPIRES_IN`         | Refresh token expiration time (100d)          |
| `EMAIL_VERIFY_TOKEN_EXPIRES_IN`    | Email verification token expiration time (2h) |
| `FORGOT_PASSWORD_TOKEN_EXPIRES_IN` | Password reset token expiration time (2h)     |

### Password Hashing

| Name              | Description                          |
| ----------------- | ------------------------------------ |
| `PASSWORD_SECRET` | Secret key used for password hashing |

### Google OAuth

| Name                       | Description                           |
| -------------------------- | ------------------------------------- |
| `GOOGLE_CLIENT_ID`         | Google OAuth client ID                |
| `GOOGLE_CLIENT_SECRET`     | Google OAuth client secret            |
| `GOOGLE_REDIRECT_URI`      | Backend redirect URI for Google OAuth |
| `CLIENT_REDIRECT_CALLBACK` | Frontend callback URL after OAuth     |
| `CLIENT_URL`               | Frontend application URL              |

### AWS Configuration

| Name                    | Description                              |
| ----------------------- | ---------------------------------------- |
| `AWS_REGION`            | AWS region for services (ap-southeast-1) |
| `AWS_ACCESS_KEY_ID`     | AWS access key ID for authentication     |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key for authentication |
| `AWS_SES_FROM_ADDRESS`  | Email address for sending via AWS SES    |
| `AWS_S3_BUCKET_NAME`    | S3 bucket name for media storage         |

## :hammer_and_wrench: Available Scripts

### Development Scripts

- `dev` - Start development server with hot reload (development environment)
- `dev:prod` - Start development server with hot reload (production environment)
- `dev:stag` - Start development server with hot reload (staging environment)
- `build` - Build the project by cleaning dist folder, compiling TypeScript, and resolving aliases

### Production Scripts

- `start:dev` - Start compiled server in development environment
- `start:prod` - Start compiled server in production environment
- `start:stag` - Start compiled server in staging environment

### Database Scripts

- `db:migrate:dev` - Run Prisma migrations in development
- `db:migrate:prod` - Run Prisma migrations in production
- `db:migrate:stag` - Run Prisma migrations in staging
- `db:push:dev` - Push schema changes to development database
- `db:push:prod` - Push schema changes to production database
- `db:push:stag` - Push schema changes to staging database
- `db:studio` - Open Prisma Studio GUI
- `db:seed` - Seed the database with initial data

### Code Quality Scripts

- `lint` - Run ESLint checks
- `lint:fix` - Run ESLint and fix issues
- `prettier` - Check code formatting
- `prettier:fix` - Fix code formatting issues

### Testing Scripts

- `test` - Run all tests
- `test:watch` - Run tests in watch mode
- `test:coverage` - Run tests with coverage report
- `test:e2e` - Run end-to-end tests
- `test:integration` - Run integration tests
- `test:unit` - Run unit tests reload enabled

## :file_folder: Folder and file Structure

```txt
📦twitter-clone-api
 ┣ 📂dist                             # Compiled JavaScript output from TypeScript source
 ┣ 📂coverage                         # Test coverage reports generated by Jest
 ┣ 📂node_modules                     # Third-party package dependencies
 ┣ 📂prisma                           # Database schema, migrations and Prisma client configuration
 ┣ 📂src                              # Source code directory
 ┃ ┣ 📂__tests__                      # Test suite directory
 ┃ ┃ ┣ 📂e2e                          # End-to-end API tests
 ┃ ┃ ┣ 📂fixtures                     # Test data and mock objects
 ┃ ┃ ┣ 📂helpers                      # Test utility functions and helper methods
 ┃ ┃ ┣ 📂integration                  # Integration tests for services and external APIs
 ┃ ┃ ┣ 📂mocks                        # Mock implementations for external dependencies
 ┃ ┃ ┣ 📂unit                         # Unit tests for individual components
 ┃ ┃ ┣ 📜app.test.ts                  # Main application tests
 ┃ ┃ ┣ 📜setup.ts                     # Test environment configuration
 ┃ ┃ ┗ 📜singleton.ts                 # Singleton pattern implementations for testing
 ┃ ┣ 📂config                         # Application configuration and environment variables
 ┃ ┣ 📂controllers                    # Request handlers and route controllers
 ┃ ┣ 📂docs                           # OpenAPI/Swagger API documentation
 ┃ ┣ 📂jobs                           # Scheduled tasks and background jobs
 ┃ ┣ 📂middlewares                    # Express middleware functions (auth, validation, error handling)
 ┃ ┣ 📂routes                         # API route definitions and endpoint handlers
 ┃ ┣ 📂services                       # Business logic and data access layer
 ┃ ┣ 📂templates                      # Email templates for notifications
 ┃ ┣ 📂types                          # TypeScript type definitions and interfaces
 ┃ ┣ 📂utils                          # Utility functions (crypto, file handling, validation)
 ┃ ┣ 📜app.ts                         # Express application setup and configuration
 ┃ ┣ 📜client.ts                      # Database client initialization
 ┃ ┣ 📜index.ts                       # Application entry point
 ┃ ┗ 📜type.d.ts                      # Global type declarations
 ┣ 📂uploads                          # User-uploaded media storage directory
 ┣ 📜.dockerignore                    # Files to exclude from Docker builds
 ┣ 📜.editorconfig                    # Editor configuration for consistent coding style
 ┣ 📜.env                             # Environment variables configuration
 ┣ 📜.eslintignore                    # Files to exclude from ESLint checks
 ┣ 📜.eslintrc                        # ESLint configuration for code linting
 ┣ 📜.gitignore                       # Files to exclude from git version control
 ┣ 📜.prettierignore                  # Files to exclude from Prettier formatting
 ┣ 📜.prettierrc                      # Prettier configuration for code formatting
 ┣ 📜docker-compose.dev.yml           # Docker Compose config for development
 ┣ 📜docker-compose.yml               # Docker Compose config for production
 ┣ 📜Dockerfile                       # Production Docker container configuration
 ┣ 📜Dockerfile.dev                   # Development Docker container configuration
 ┣ 📜ecosystem.config.js              # PM2 process manager configuration
 ┣ 📜jest.config.ts                   # Jest test runner configuration
 ┣ 📜nodemon.json                     # Nodemon configuration for development
 ┣ 📜package.json                     # Project metadata and dependencies
 ┣ 📜README.md                        # Project documentation
 ┣ 📜send-email.js                    # Email sending utility script
 ┣ 📜tsconfig.json                    # TypeScript compiler configuration
 ┗ 📜twitter-clone-swagger.yaml       # OpenAPI/Swagger API specification
```

## :book: Online Swagger doc

The automatically generated documentation will be accessible on the web at url https://twittage.com/api-docs.

<div align="left">
  <kbd>
    <img src="https://utfs.io/f/B9dfElgKSkF1q5M1miIIeGLrQYsfPXEMO26yuZladRVbHUwc" 
    width="650"
    alt="swagger-web-doc"/>
  </kbd>
</div>

## Postgresql database creation example

### Option 1 - Create your database from the pgAdmin tool

#### Download and install pgAdmin

Download and install the [pgAdmin](https://www.pgadmin.org/download/) tool for [PostgreSQL](https://www.postgresql.org/download/) database management.

<div align="left">
  <kbd>
    <img src="https://utfs.io/f/B9dfElgKSkF16ojCzA5Kdon8MtSHc2ziuAjL9wxbKl4Ysk7f" 
    width="650"
    alt="pgadmin-tool"/>
  </kbd>
</div>

#### Create a PostgreSQL server instance

Run `pgAdmin`. Right-click on the item `Servers`, select `Create` -> `Server` and provide the connection to your PostgreSQL instance configured in the pgAdmin installation step. On the connection tab, make sure you have filled in the host as localhost as well as the access credentials. Click `Save` afterwards.

<div align="left">
  <kbd>
    <img src="https://utfs.io/f/B9dfElgKSkF1U7mKsYZIEHFiQp9f8lkc4ewA2sxh73JXGSTo" 
    width="380"
    alt="pgadmin-create-server-instance"/>
  </kbd>
</div>
<br/>

#### Create a PostgreSQL database

Run `pgAdmin`. Right-click on the item `Servers`, select `Create` -> `Server` and provide the connection to your PostgreSQL instance configured in the pgAdmin installation step. On the connection tab, make sure you have filled in the host as localhost as well as the access credentials. Click `Save` afterwards.

<div align="left">
  <kbd>
    <img src="https://utfs.io/f/B9dfElgKSkF1Pxf36EMLhlQvTexBEsHnRaqcj1LGNy9JF8mV" 
    width="380"
    alt="pgadmin-create-database"/>
  </kbd>
</div>
<br/>

Reports the URL based on the credentials and database information in the `DATABASE_URL` variable located in the `.env` file. Example:

```bash
#.env
...
# DATABASE
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?sslmode=require&schema=public"
...
```

### Option 2 - Create your database from Hosting Cloud Service

[Supabase](https://supabase.com/) is an open-source Firebase alternative.

It provides a set of tools and services to help you build your project faster.

It is based on PostgreSQL and provides a real-time database, authentication, and file storage.

Supabase has a free tier that allows you to create a PostgreSQL database and use it for your project.

## Create a project on Supabase

Go to the [Supabase](https://supabase.com/) website and create an account.

After creating an account, go to your [dashboard](https://supabase.com/dashboard/projects).

Click on the `New Project` button to create a new project.

[![Supabase](https://utfs.io/f/B9dfElgKSkF1qjxa4TIIeGLrQYsfPXEMO26yuZladRVbHUwc)](https://utfs.io/f/B9dfElgKSkF1qjxa4TIIeGLrQYsfPXEMO26yuZladRVbHUwc)

[![Supabase](https://utfs.io/f/B9dfElgKSkF1615S9gKdon8MtSHc2ziuAjL9wxbKl4Ysk7fm)](https://utfs.io/f/B9dfElgKSkF1615S9gKdon8MtSHc2ziuAjL9wxbKl4Ysk7fm)

## Access the project's database settings

Access the project's database settings on Supabase and copy the `URI` of the database.

When copying `URI`, remember to copy `URI` in both `Transaction` and `Session` modes.

[![Supabase](https://utfs.io/f/B9dfElgKSkF1csLxnTSAEKLGZxiQDSjM9JyaOzulVFowr4et)](https://utfs.io/f/B9dfElgKSkF1csLxnTSAEKLGZxiQDSjM9JyaOzulVFowr4et)

Copy the `Transaction URI` for the `DATABASE_URL` and `Session URI` for the `DIRECT_URL` variable located in the `.env` file.

The free tier of Supabase provides a PostgreSQL database is limited to 500MB of storage.

## Add the following prefixes for Database URI (Optional)

```.env
#.env
# `pgbouncer=true` will help you connect to the database through a connection pooler.
# `connection_limit=1` will help you limit the maximum number of connections.
DATABASE_URL="postgres://postgres:password@localhost:6543/postgres?pgbouncer=true&connection_limit=1"
```
