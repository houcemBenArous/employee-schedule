# Planning - Frontend

![Angular](https://img.shields.io/badge/Angular-17.3.11-DD0031?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.2-3178C6?style=flat-square&logo=typescript)
![Bootstrap](https://img.shields.io/badge/Bootstrap-Icons-7952B3?style=flat-square&logo=bootstrap)

## 📋 Overview

Planning is a versatile scheduling application designed for organizations of all types. It provides an intuitive interface for managing staff schedules, appointments, and resource allocation in any environment.

### ✨ Key Features

- **Multiple View Modes**: Weekly and monthly calendar views
- **Interactive Scheduling**: Drag-and-drop functionality for easy schedule management
- **Staff Management**: Organize schedules by employee and role
- **Responsive Design**: Works on desktop and mobile devices
- **Server-Side Rendering**: Improved performance and SEO with Angular SSR

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or later recommended)
- npm (v9.x or later)
- Angular CLI (v17.3.x)

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd <project-folder>/frontend
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the development server

   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:4200`

## 🛠️ Development

### Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code Scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Server-Side Rendering

This project is configured with Angular Universal for server-side rendering:

```bash
npm run serve:ssr:frontend
```

This will start the SSR server on port 4000. Navigate to `http://localhost:4000`.

## 🧪 Testing

### Running Unit Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running End-to-End Tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── shedule/         # Main scheduling component
│   │   ├── app.component.*  # Root component
│   │   ├── app.config.ts    # Application configuration
│   │   └── app.routes.ts    # Application routes
│   ├── assets/
│   │   └── schedule-data.json  # Sample schedule data
│   ├── index.html           # Main HTML template
│   └── main.ts              # Application entry point
├── server.ts                # Server-side rendering configuration
└── package.json             # Project dependencies
```

## 🔧 Configuration

The application can be configured through the following files:

- `angular.json` - Angular CLI configuration
- `tsconfig.json` - TypeScript compiler options
- `package.json` - Project dependencies and scripts

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular CLI Overview and Command Reference](https://angular.io/cli)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📄 License

This project is licensed under the [MIT License](LICENSE).
