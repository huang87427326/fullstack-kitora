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
    // subject 不能为空
    'subject-empty': [2, 'never'],
    // type 不能为空
    'type-empty': [2, 'never'],
    // body / footer 前必须有空行
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
};
