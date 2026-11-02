import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { importX } from 'eslint-plugin-import-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// TypeScript house style: strict type-aware linting for every .ts file, plus Astro's recommended and
// accessibility rules for .astro templates. Config files that the tools require to default-export are exempt
// from the named-exports rule.
export default tseslint.config(
    {
        ignores: ['dist/', '.astro/', 'node_modules/', 'OnixLabs.Web/', 'test-results/', 'playwright-report/', '.lighthouseci/'],
    },
    js.configs.recommended,
    ...astro.configs['flat/recommended'],
    ...astro.configs['flat/jsx-a11y-strict'],
    {
        files: ['**/*.ts'],
        extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
        plugins: { 'import-x': importX },
        settings: {
            'import-x/resolver-next': [createTypeScriptImportResolver()],
        },
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/typedef': ['error', {
                arrowParameter: true,
                memberVariableDeclaration: true,
                parameter: true,
                propertyDeclaration: true,
                variableDeclaration: true,
                objectDestructuring: true,
                arrayDestructuring: true,
            }],
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            '@typescript-eslint/explicit-member-accessibility': 'error',
            '@typescript-eslint/member-ordering': 'error',
            '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: false, ignoreRestArgs: false }],
            '@typescript-eslint/no-unsafe-type-assertion': 'error',
            '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/array-type': ['error', { default: 'array', readonly: 'generic' }],
            '@typescript-eslint/prefer-readonly': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/require-await': 'error',
            '@typescript-eslint/promise-function-async': 'error',
            '@typescript-eslint/only-throw-error': 'error',
            // tsconfig's noPropertyAccessFromIndexSignature requires bracket access for index signatures.
            '@typescript-eslint/dot-notation': ['error', { allowIndexSignaturePropertyAccess: true }],
            '@typescript-eslint/naming-convention': ['error',
                { selector: 'default', format: ['camelCase'], leadingUnderscore: 'forbid' },
                { selector: 'import', format: ['camelCase', 'PascalCase'] },
                { selector: 'typeLike', format: ['PascalCase'] },
                { selector: 'enumMember', format: ['PascalCase'] },
                { selector: 'interface', format: ['PascalCase'], custom: { regex: '^I[A-Z]', match: false } },
                // Quoted keys such as '@type' (JSON-LD) and 'Content-Type' are data, not identifiers.
                { selector: ['objectLiteralProperty', 'typeProperty'], modifiers: ['requiresQuotes'], format: null },
            ],
            'import-x/no-default-export': 'error',
            'import-x/no-cycle': 'error',
            'max-classes-per-file': ['error', 1],
        },
    },
    {
        files: ['*.config.ts'],
        rules: {
            'import-x/no-default-export': 'off',
        },
    },
    {
        // Astro infers each collection's type from its Zod schema; the type can't usefully be written out.
        files: ['src/content.config.ts'],
        rules: {
            '@typescript-eslint/typedef': ['error', { parameter: true, arrowParameter: true, variableDeclaration: false }],
        },
    },
    {
        // Astro endpoints must export upper-case HTTP method names (GET, POST, ...).
        files: ['src/pages/**/*.ts'],
        rules: {
            '@typescript-eslint/naming-convention': ['error',
                { selector: 'variable', modifiers: ['exported'], format: ['UPPER_CASE'] },
            ],
        },
    },
);
