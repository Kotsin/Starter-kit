#!/usr/bin/env node

let inquirer = require('inquirer');
if (inquirer.default) inquirer = inquirer.default;
const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.resolve(__dirname, '../packages');
const APPS_DIR = path.resolve(__dirname, '../apps');

async function getAvailablePackages() {
  return fs.readdirSync(PACKAGES_DIR).filter((name) => {
    const stat = fs.statSync(path.join(PACKAGES_DIR, name));
    return stat.isDirectory();
  });
}

async function getAvailableClients() {
  const clientsDir = path.join(PACKAGES_DIR, 'common', 'src', 'clients');
  if (!fs.existsSync(clientsDir)) return [];
  return fs.readdirSync(clientsDir).filter((name) => {
    const stat = fs.statSync(path.join(clientsDir, name));
    return stat.isDirectory();
  });
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function toPascalCase(str) {
  return str
    .replace(/(^\w|[-_\s]\w)/g, (m) => m.replace(/[-_\s]/, '').toUpperCase());
}

async function main() {
  console.log('\n=== Microservice Generator ===\n');

  const availablePackages = await getAvailablePackages();
  const availableClients = await getAvailableClients();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'serviceName',
      message: 'Microservice name (kebab-case, e.g. order-service):',
      validate: (input) =>
        /^[a-z][a-z0-9-]+$/.test(input) || 'Use kebab-case, e.g. order-service',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description (optional):',
    },
    {
      type: 'checkbox',
      name: 'packages',
      message: 'Select base packages to include:',
      choices: availablePackages,
      default: ['common', 'config', 'logger', 'database'],
    },
    {
      type: 'checkbox',
      name: 'clients',
      message: 'Select microservice clients to include:',
      choices: availableClients,
    },
  ]);

  const { serviceName, description, packages, clients } = answers;
  const pascalName = toPascalCase(serviceName.replace(/-service$/, ''));
  const appDir = path.join(APPS_DIR, serviceName);

  if (fs.existsSync(appDir)) {
    console.error(`\nDirectory ${appDir} already exists! Aborting.`);
    process.exit(1);
  }

  // 1. Create directory structure
  fs.mkdirSync(appDir);
  fs.mkdirSync(path.join(appDir, 'src'));
  fs.mkdirSync(path.join(appDir, 'src', 'controllers'));
  fs.mkdirSync(path.join(appDir, 'src', 'services'));
  fs.mkdirSync(path.join(appDir, 'src', 'interfaces'));

  // 2. Generate package.json
  const pkgJson = {
    name: `@crypton-nestjs-kit/${serviceName}`,
    version: '0.0.1',
    description: description || '',
    author: '',
    license: 'MIT',
    scripts: {
      'start:dev': 'nest start --watch',
      'start:debug': 'nest start --debug --watch',
      build: 'tsc -p tsconfig.build.json',
      'start:test': 'tsc-watch -p tsconfig.build.json --onSuccess "node -r dotenv/config dist/main.js dotenv_config_path=../.env.test"',
      'start:prod': 'node dist/main.js',
      lint: 'eslint "{src,test}/**/*.ts" --no-error-on-unmatched-pattern --quiet --fix',
      'docs:generate': `compodoc -p tsconfig.build.json -d ../../docs/${serviceName}`,
      'docs:serve': `compodoc -p tsconfig.build.json -d ../../docs/${serviceName} -s`,
      'docs:watch': `compodoc -p tsconfig.build.json -d ../../docs/${serviceName} -w`,
    },
    engines: {
      node: '>=18.x',
      npm: '>=10.2.x',
    },
    devEngines: {
      node: '>=18.x',
      npm: '>=10.2.x',
    },
    dependencies: {
      '@nestjs/common': '10.4.15',
      '@nestjs/core': '10.4.15',
      '@nestjs/microservices': '10.4.15',
      '@nestjs/platform-express': '10.4.15',
      '@nestjs/swagger': '7.3.1',
      '@nestjs/terminus': '^10.2.3',
      '@nestjs/typeorm': '^10.0.2',
      ...Object.fromEntries(
        packages.map((pkg) => [
          `@crypton-nestjs-kit/${pkg}`,
          'workspace:^1.0.0',
        ]),
      ),
      axios: '^1.7.2',
      'class-transformer': '^0.5.1',
      'class-validator': '^0.14.1',
      express: '^4.17.1',
      pg: '^8.11.5',
      redis: '^4.6.13',
      'reflect-metadata': '0.2.2',
      rimraf: '^5.0.6',
      rxjs: '7.8.1',
      typeorm: '^0.3.20',
      uuid: '^9.0.1',
      uuidv4: '^6.2.13',
      winston: '^3.13.0',
    },
    devDependencies: {
      '@compodoc/compodoc': '^1.1.23',
      '@nestjs/cli': '^10.3.2',
      '@nestjs/schematics': '^10.1.1',
      '@nestjs/testing': '^10.3.8',
      '@types/eslint-plugin-prettier': '^3.1.0',
      '@types/express': '^4.17.21',
      '@types/jsonwebtoken': '^9.0.6',
      '@types/node': '^20.12.11',
      '@types/supertest': '^6.0.2',
      '@typescript-eslint/eslint-plugin': '^5.30.5',
      '@typescript-eslint/parser': '^5.30.5',
      concurrently: '^8.2.2',
      copyfiles: '^2.4.1',
      dotenv: '^16.4.5',
      'dotenv-cli': '^7.4.2',
      eslint: '^8.26.0',
      'eslint-config-prettier': '^8.5.0',
      'eslint-plugin-import': '^2.18.2',
      'eslint-plugin-prettier': '^4.0.0',
      'eslint-plugin-simple-import-sort': '^10.0.0',
      nock: '^13.5.4',
      nodemon: '^3.1.0',
      prettier: '^2.3.2',
      rimraf: '^3.0.2',
      supertest: '^7.0.0',
      'ts-jest': '^29.1.2',
      'ts-loader': '^9.5.1',
      'ts-node': '^10.9.2',
      typescript: '^5.2.2',
    },
  };
  fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

  // 3. Copy config files
  const configFiles = [
    { name: '.dockerignore', content: `# Dependencies
node_modules
npm-debug.log
yarn-debug.log
yarn-error.log
pnpm-debug.log

# Source control
.git
.gitignore
.gitattributes

# IDE
.idea
.vscode
*.swp
*.swo

# Build output
dist
build
coverage

# Environment files
.env
.env.*
!.env.example

# Test files
__tests__
*.test.ts
*.spec.ts

# Documentation
docs
*.md
!README.md

# Development configs
nodemon.json
docker-compose*.yml
Dockerfile*
.dockerignore

# Misc
.DS_Store
*.log
tmp
temp
` },
    { name: '.eslintrc.js', content: `module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'simple-import-sort'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'max-lines-per-function': ['error', {
      max: 90,
      skipBlankLines: true,
      skipComments: true,
    }],
    "@typescript-eslint/naming-convention": [
      "warn",
      { "selector": "class", "format": ["PascalCase"] },
      { "selector": "enum", "format": ["UPPER_CASE"] },
      {
        "selector": "variable",
        "format": ["camelCase"],
        custom: {
          "regex": "^[a-z]+([A-Z][a-z]+){0,3}$",
          "match": true,
          "message": 'Variable names should contain no more than 4 words in camelCase'
        },
      },
      {
        "selector": "function",
        "format": ["camelCase"],
        custom: {
          "regex": "^[a-z]+([A-Z][a-z]+){0,3}$",
          "match": true
        }
      },
      {
        "selector": "property",
        "format": ["snake_case", "camelCase"],
        custom: {
          "regex": "^[a-z]+([A-Z][a-z]+){0,3}$",
          "match": true
        }
      },
      {
        "selector": "method",
        "format": ["camelCase"],
        custom: {
          "regex": "^[a-z]+([A-Z][a-z]+){0,3}$",
          "match": true
        }
      }
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-inferrable-types': 'warn',
    '@typescript-eslint/prefer-readonly': 'warn',
    '@typescript-eslint/quotes': [
      'warn',
      'single',
      { allowTemplateLiterals: true },
    ],
    "import/no-unresolved": "off",
    'prefer-const': 'warn',
    'padding-line-between-statements': [
      'warn',
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: '*', next: 'if' },
      { blankLine: 'always', prev: 'if', next: '*' },
      { blankLine: 'always', prev: '*', next: 'throw' },
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
    ],
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^\\u0000'],
          ['^@nestjs', '^@?\\w'],
          ['^(@|app)(/.*|$)'],
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
        ],
      },
    ],
  },
};
` },
    { name: '.gitignore', content: `# From https://github.com/github/gitignore/blob/master/Node.gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

rabbitmq/

.DS_Store
# Runtime dataF
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript


# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test
.env.local
app.json
# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test
.vscode

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# Custom
#
# TypeScript declaration files and source maps
*.d.ts
*.js.map
*.d.ts.map
# Build output
dist/
build/

*.zip
/.nx/
.idea

docker/


.nx/cache
` },
    { name: '.prettierrc', content: '{\n  "singleQuote": true,\n  "trailingComma": "all"\n}\n' },
    { name: 'nest-cli.json', content: '{\n  "language": "ts",\n  "compilerOptions": {\n    "assets": ["**/*.proto"],\n    "watchAssets": true\n  },\n  "collection": "@nestjs/schematics",\n  "sourceRoot": "src"\n}\n' },
    { name: 'tsconfig.build.json', content: '{\n  "extends": "./tsconfig.json",\n  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]\n}\n' },
    { name: 'tsconfig.json', content: '{\n  "compilerOptions": {\n    "module": "commonjs",\n    "removeComments": true,\n    "emitDecoratorMetadata": true,\n    "experimentalDecorators": true,\n    "allowSyntheticDefaultImports": true,\n    "target": "es2017",\n    "sourceMap": true,\n    "outDir": "./dist",\n    "baseUrl": "./",\n    "incremental": true,\n    "skipLibCheck": true,\n    "strictNullChecks": false,\n    "strictFunctionTypes": true,\n    "strictPropertyInitialization": false,\n    "noImplicitAny": false,\n    "strict": false,\n    "strictBindCallApply": false,\n    "forceConsistentCasingInFileNames": false,\n    "esModuleInterop": true,\n    "resolveJsonModule": true,\n    "noFallthroughCasesInSwitch": false,\n    "declaration": true,\n    "declarationMap": true\n  },\n  "exclude": ["node_modules", "dist"]\n}\n' },
    { name: '.env', content: '' },
    { name: '.env.example', content: '# Example of .env. Fill the required fields like in README.md\n' },
  ];
  configFiles.forEach(({ name, content }) => {
    fs.writeFileSync(path.join(appDir, name), content);
  });

  // 4. Generate src/main.ts
  const mainTs = `require('dotenv').config();\n\nimport { NestFactory } from '@nestjs/core';\nimport { RmqOptions } from '@nestjs/microservices';\nimport { ConfigService } from '@crypton-nestjs-kit/config';\n\nimport { ${pascalName}Module } from './${serviceName.replace(/-service$/, '')}.module';\n\nasync function bootstrap(): Promise<void> {\n  const configService = new ConfigService();\n  configService.loadFromEnv();\n  const serviceConfig = configService.get().${serviceName.replace(/-/g, '')} as RmqOptions;\n  const app = await NestFactory.createMicroservice(${pascalName}Module, serviceConfig);\n  await app.listen();\n}\n\nbootstrap();\n`;
  fs.writeFileSync(path.join(appDir, 'src', 'main.ts'), mainTs);

  // 5. Generate src/<name>.module.ts
  const moduleTs = `import { Module } from '@nestjs/common';\nimport { TypeOrmModule } from '@nestjs/typeorm';\nimport { ConfigModule, ConfigService } from '@crypton-nestjs-kit/config';\nimport { DBModule } from '@crypton-nestjs-kit/database';\n\nimport { ${pascalName}Controller } from './controllers/${serviceName.replace(/-service$/, '')}.controller';\nimport { ${pascalName}Service } from './services/${serviceName.replace(/-service$/, '')}.service';\n\n@Module({\n  imports: [\n    ConfigModule,\n    DBModule.forRoot({ entities: [] }),\n    TypeOrmModule.forRootAsync({\n      imports: [ConfigModule],\n      useFactory: (configService: ConfigService) => {\n        const db = configService.get().db;\n        return {\n          type: 'postgres',\n          host: db.host,\n          port: db.port,\n          username: db.username,\n          password: db.password,\n          database: db.database,\n          synchronize: true,\n          logging: false,\n          entities: [],\n        };\n      },\n      inject: [ConfigService],\n    }),\n    TypeOrmModule.forFeature([]),\n  ],\n  controllers: [${pascalName}Controller],\n  providers: [${pascalName}Service],\n})\nexport class ${pascalName}Module {}\n`;
  fs.writeFileSync(path.join(appDir, 'src', `${serviceName.replace(/-service$/, '')}.module.ts`), moduleTs);

  // 6. Generate src/controllers/<name>.controller.ts
  const controllerTs = `import { Controller, Get } from '@nestjs/common';\n\n@Controller()\nexport class ${pascalName}Controller {\n  @Get('/')\n  health() {\n    return { status: 'ok' };\n  }\n}\n`;
  fs.writeFileSync(path.join(appDir, 'src', 'controllers', `${serviceName.replace(/-service$/, '')}.controller.ts`), controllerTs);

  // 7. Generate src/services/<name>.service.ts
  const serviceTs = `import { Injectable } from '@nestjs/common';\n\n@Injectable()\nexport class ${pascalName}Service {\n  // Add your business logic here\n}\n`;
  fs.writeFileSync(path.join(appDir, 'src', 'services', `${serviceName.replace(/-service$/, '')}.service.ts`), serviceTs);

  // 8. Generate src/interfaces/index.ts
  fs.writeFileSync(path.join(appDir, 'src', 'interfaces', 'index.ts'), '// Add your interfaces here\n');

  // 9. Success message
  console.log(`\nMicroservice '${serviceName}' created in apps/${serviceName}`);
  console.log('Next steps:');
  console.log(`  cd apps/${serviceName}`);
  console.log('  pnpm install');
  console.log('  pnpm run start:dev');
}

main(); 