# Cyber Exam Platform

A comprehensive exam practice platform for cybersecurity certifications (e.g., CEH), built with Next.js and Prisma.

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn (recommended) or npm

### Setup

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Setup Database**
   This project uses SQLite by default. You need to generate the Prisma client and push the schema to the database.
   ```bash
   # Generate Prisma Client
   yarn prisma generate

   # Push schema to dev database
   yarn prisma db push
   ```

### Running Locally

To start the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Building for Production

```bash
yarn build
yarn start
```
