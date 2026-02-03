# Ecommerce Fashion Backend

Backend application for a Fashion Ecommerce platform, built with Fastify, TypeScript, and Drizzle ORM.

![Ecommerce Fashion Database Diagram](https://ik.imagekit.io/htnacim0q/media-ak-shop/setting/design-sytem-db.svg)

🔗 View & edit diagram at: https://dbdiagram.io/d/apk-app-697c542ebd82f5fce21a8977

## 🚀 Features

- **High Performance**: Built on Fastify for low overhead and high speed.
- **Type Safety**: Full TypeScript support with Zod validation.
- **Database**: PostgreSQL with Drizzle ORM for type-safe database interactions.
- **Authentication**: Secure JWT authentication and Better Auth integration.
- **Media Management**: Image upload and management via ImageKit.
- **Email Service**: Transactional emails using Brevo (formerly Sendinblue).
- **Security**: Rate limiting, CORS, Helmet protection.
- **Documentation**: Integrated Swagger UI for API documentation.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: [Fastify](https://www.fastify.io/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/)
- **Logging**: Winston, Pino
- **Services**:
  - **ImageKit**: Media storage and optimization.
  - **Brevo**: Email delivery.
  - **Sentry**: Error tracking.

## 📂 Project Structure

```bash
ecommerce-fashion-be/
├── src/
│   ├── modules/          # Feature-based modules (Controller, Service, Repository, Route, Schema)
│   ├── db/               # Database schema and connection setup
│   ├── routes/           # Global route definitions
│   ├── middleware/       # Custom middleware (Auth, Error handling, etc.)
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   ├── constants/        # Constant values
│   ├── types/            # TypeScript type definitions
│   ├── app.ts            # App entry point and plugin registration
│   └── server.ts         # Server startup script
├── drizzle/              # Drizzle migrations and metadata
├── .env.example          # Environment variable example
├── drizzle.config.ts     # Drizzle configuration
└── package.json          # Dependencies and scripts
```

## ⚡ Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **PostgreSQL** Database (or a Neon.tech connection string)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/phongphanq089/ecommerce-fashion-be.git
    cd ecommerce-fashion-be
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Configuration**
    Copy the example environment file and rename it to `.env`:
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with your credentials:
    - `DATABASE_URL` & `DIRECT_URL`: Your PostgreSQL connection strings.
    - `ACCESS_TOKEN_SECRET_SIGNATURE`: Secret for JWT.
    - `IMAGE_KIT_*`: ImageKit credentials.
    - `BREVO_API_KEY`: Email service API key.
    - See `.env.example` for all available options.

### Database Setup

1.  **Generate SQL migrations**

    ```bash
    npm run db:generate
    ```

2.  **Push schema to database**

    ```bash
    npm run db:push
    ```

3.  **Run migrations (if applicable)**

    ```bash
    npm run db:migrate
    ```

4.  **Open Drizzle Studio (Optional)**
    Manage your data visually:
    ```bash
    npm run db:studio
    ```

## 🏃 Usage

### Development Mode

Runs the server with hot-reloading:

```bash
npm run dev
```

Server usually starts at `http://localhost:3000`.

### Production Build

Build the TypeScript code and start the server:

```bash
npm run build
npm start
```

### API Documentation

Once the server is running, you can access the Swagger UI documentation at:

```
http://localhost:3000/documentation
```

_(Note: Verify the exact path in `src/app.ts` if different)_

## 📜 Scripts

- `npm run dev`: Start development server.
- `npm run build`: Compile TypeScript to JavaScript.
- `npm start`: Start production server.
- `npm run lint`: Lint code with ESLint.
- `npm run format`: Format code with Prettier.
- `npm run db:push`: Push schema changes directly to DB.
- `npm run db:studio`: Launch Drizzle Studio.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## 📄 License

[ISC](LICENSE)
