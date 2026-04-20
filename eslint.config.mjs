// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.pnpm-store/**',
      '**/pnpm-lock.yaml',
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },

  // JS / MJS / CJS 文件关闭需要类型信息的 TS 规则
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },

  // 配置文件不参与类型感知
  {
    files: [
      '*.config.{js,mjs,cjs,ts,mts,cts}',
      '**/*.config.{js,mjs,cjs,ts,mts,cts}',
      'eslint.config.mjs',
    ],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
    ...tseslint.configs.disableTypeChecked,
  },

  // Node 脚本环境：scripts/ 下的一次性工具脚本 + 各类 *.config.* 都跑在
  // Node 里，要声明 Node 全局，否则 `no-undef` 会把 process / console 等报成未定义
  {
    files: [
      'scripts/**/*.{js,mjs,cjs,ts,mts,cts}',
      '*.config.{js,mjs,cjs,ts,mts,cts}',
      '**/*.config.{js,mjs,cjs,ts,mts,cts}',
      'eslint.config.mjs',
      'prisma.config.ts',
      '**/prisma.config.ts',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // 必须放最后：关闭所有与 Prettier 冲突的格式化类规则
  prettier,
);
