/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 允许中文主语：关闭大小写约束（conventional 默认要求小写）
    'subject-case': [0],
    // 项目约定 subject 不加句号，但允许灵活（在 CONTRIBUTING.md 声明即可）
    'subject-full-stop': [0],
    // body / footer 行长度：URL、命令行、代码块等可能超长，不强制
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
    // scope 约束：允许小写 + 连字符（已是默认，这里显式声明强化团队习惯）
    'scope-case': [2, 'always', 'lower-case'],
    // type 必须小写
    'type-case': [2, 'always', 'lower-case'],
    // type 白名单：与 CONTRIBUTING.md §Git 提交规范一致
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'revert'],
    ],
    // scope 白名单：与 CONTRIBUTING.md §Git 提交规范一致
    // 允许 scope 为空（不强制填写），一旦填写必须命中白名单；
    // 新增 app / package 时，请同步更新此处 + CONTRIBUTING.md
    'scope-enum': [
      2,
      'always',
      [
        // === apps/* ===
        'web',
        'admin',
        'marketing',

        // === packages/* ===
        'auth',
        'config',
        'db',
        'email',
        'i18n',
        'types',
        'ui',
        'utils',

        // === 跨目录聚合（多个 app / package 一起改时用）===
        'apps',
        'packages',

        // === 工程 / 工具链 ===
        'monorepo', // pnpm workspace / turbo 骨架
        'tooling', // 构建脚本、开发工具、非上述细分的工程杂项
        'lint', // eslint / prettier / editorconfig
        'format', // 纯格式化（可选，通常走 type=style）
        'husky', // husky hooks / lint-staged
        'commitlint', // commitlint 本身
        'pnpm', // pnpm 配置（.npmrc / 构建白名单 等）
        'turbo', // turbo.json / 任务编排
        'tsconfig', // TS 配置
        'ci', // GitHub Actions workflow
        'deps', // 依赖升级
        'release', // 版本 / 发版流程
        'ship', // 发布 / 部署脚本（scripts/ship 等）
        'docs', // 仓库文档
        'scripts', // scripts/ 目录下的脚本
      ],
    ],
    // subject 不能为空
    'subject-empty': [2, 'never'],
    // type 不能为空
    'type-empty': [2, 'never'],
    // body / footer 前必须有空行
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
};
