// VitePress configuration for the personal-bot documentation site.
//
// Plain JavaScript on purpose: release/personal-bot becomes the public
// repository, and the release scan refuses TypeScript sources there
// (release/README.md, "What the scan covers"), so the config is .mjs and the
// content is Markdown. Chinese is the root locale, English the /en/ mirror.
//
// Build from this directory:  pnpm docs:build   (output: .vitepress/dist)
// The GitHub Actions workflow that publishes it lives at
// .github/workflows/docs-pages.yml in the repository root.

/** One sidebar section: its heading and the pages under it. */
function section(text, items) {
  return { text, items };
}

/** The page order the console itself uses, so the docs read like the panel. */
function consolePages(prefix, labels) {
  return [
    { text: labels.overview, link: `${prefix}/console/` },
    { text: labels.conversations, link: `${prefix}/console/conversations` },
    { text: labels.persona, link: `${prefix}/console/persona` },
    { text: labels.memory, link: `${prefix}/console/memory` },
    { text: labels.stickers, link: `${prefix}/console/stickers` },
    { text: labels.schedules, link: `${prefix}/console/schedules` },
    { text: labels.models, link: `${prefix}/console/models` },
    { text: labels.safety, link: `${prefix}/console/safety` },
    { text: labels.workspace, link: `${prefix}/console/workspace` },
    { text: labels.advanced, link: `${prefix}/console/advanced` },
    { text: labels.logs, link: `${prefix}/console/logs` },
  ];
}

const CONSOLE_LABELS_ZH = {
  overview: '概览与 QQ',
  conversations: '会话与策略',
  persona: '人设',
  memory: '记忆',
  stickers: '表情包',
  schedules: '定时',
  models: '模型与 Jev',
  safety: '安全',
  workspace: '工作区',
  advanced: '高级设置',
  logs: '日志',
};

const CONSOLE_LABELS_EN = {
  overview: 'Overview and QQ',
  conversations: 'Conversations and policies',
  persona: 'Persona',
  memory: 'Memory',
  stickers: 'Stickers',
  schedules: 'Schedules',
  models: 'Models and Jev',
  safety: 'Safety',
  workspace: 'Workspace',
  advanced: 'Advanced settings',
  logs: 'Logs',
};

const zhSidebar = [
  section('开始使用', [
    { text: '快速开始', link: '/guide/quick-start' },
    { text: '首次启动与扫码登录', link: '/guide/first-start' },
  ]),
  section('配置', [
    { text: '环境变量（.env）', link: '/guide/env' },
    { text: 'compose 与数据卷', link: '/guide/compose' },
  ]),
  section('控制台', consolePages('/guide', CONSOLE_LABELS_ZH)),
  section('工具与集成', [{ text: 'MCP 客户端（OAuth）', link: '/guide/mcp' }]),
  section('深入了解', [
    { text: '它是怎么工作的', link: '/guide/how-it-works' },
    { text: '更新', link: '/guide/updating' },
    { text: '排障', link: '/guide/troubleshooting' },
    { text: '免责声明', link: '/guide/disclaimer' },
  ]),
];

const enSidebar = [
  section('Getting started', [
    { text: 'Quick start', link: '/en/guide/quick-start' },
    { text: 'First start and QR login', link: '/en/guide/first-start' },
  ]),
  section('Configuration', [
    { text: 'Environment variables (.env)', link: '/en/guide/env' },
    { text: 'compose and data volumes', link: '/en/guide/compose' },
  ]),
  section('Console', consolePages('/en/guide', CONSOLE_LABELS_EN)),
  section('Tools and integration', [{ text: 'MCP client (OAuth)', link: '/en/guide/mcp' }]),
  section('Going deeper', [
    { text: 'How it works', link: '/en/guide/how-it-works' },
    { text: 'Updating', link: '/en/guide/updating' },
    { text: 'Troubleshooting', link: '/en/guide/troubleshooting' },
    { text: 'Disclaimer', link: '/en/guide/disclaimer' },
  ]),
];

export default {
  lang: 'zh-CN',
  title: 'personal-bot',
  description: '自托管的个人助理：部署在自有设备上，记忆保存在本地文件',
  base: '/personal-bot/',
  // cleanUrls stays off: GitHub Pages serves the built files as they are, and
  // every .html link resolves there without depending on extension stripping.
  cleanUrls: false,
  lastUpdated: true,
  // site/README.md is the directory's README on GitHub, not a page.
  srcExclude: ['**/README.md'],
  // The docs link to a console on http://localhost:8080, which is not a dead
  // link, it is where the panel is reached.
  ignoreDeadLinks: 'localhostLinks',
  sitemap: { hostname: 'https://4fuu.github.io/personal-bot' },
  head: [
    ['meta', { name: 'theme-color', content: '#3a6ea5' }],
    ['meta', { property: 'og:type', content: 'website' }],
    // Favicon slot: the file comes from the repository's assets/ directory,
    // which the deploy workflow copies into the site root
    // (.github/workflows/docs-pages.yml). It answers 404 until the file lands;
    // rename the reference if the artwork lands under another name.
    ['link', { rel: 'icon', href: '/personal-bot/assets/favicon.ico' }],
  ],
  // Only what both locales share. Every label that differs between them lives
  // in that locale's own themeConfig below, so neither leaks into the other.
  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/4fuu/personal-bot' }],
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'personal-bot',
      description: '自托管的个人助理：部署在自有设备上，记忆保存在本地文件',
      themeConfig: {
        nav: [
          { text: '快速开始', link: '/guide/quick-start' },
          { text: '配置', link: '/guide/env' },
          { text: '控制台', link: '/guide/console/' },
          { text: 'MCP', link: '/guide/mcp' },
          { text: '工作原理', link: '/guide/how-it-works' },
        ],
        sidebar: zhSidebar,
        outline: { level: [2, 3], label: '本页目录' },
        docFooter: { prev: '上一篇', next: '下一篇' },
        darkModeSwitchLabel: '外观',
        lightModeSwitchTitle: '切换到浅色主题',
        darkModeSwitchTitle: '切换到深色主题',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '回到顶部',
        langMenuLabel: '切换语言',
        skipToContentLabel: '跳到主要内容',
        notFound: {
          title: '页面不存在',
          quote: '你要找的页面可能已被移动或删除。',
          linkLabel: '返回首页',
          linkText: '回到首页',
        },
        editLink: {
          pattern: 'https://github.com/4fuu/personal-bot/edit/main/site/:path',
          text: '在 GitHub 上编辑此页',
        },
        search: {
          provider: 'local',
          options: {
            translations: {
              button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
              modal: {
                displayDetails: '显示详情',
                resetButtonTitle: '重置',
                backButtonTitle: '返回',
                noResultsText: '未找到结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '回车',
                  navigateText: '切换',
                  navigateUpKeyAriaLabel: '上箭头',
                  navigateDownKeyAriaLabel: '下箭头',
                  closeText: 'Esc',
                },
              },
            },
          },
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'personal-bot',
      description:
        'A self-hosted personal assistant that runs on your own machine and stores its memory in files you control',
      themeConfig: {
        nav: [
          { text: 'Quick start', link: '/en/guide/quick-start' },
          { text: 'Configuration', link: '/en/guide/env' },
          { text: 'Console', link: '/en/guide/console/' },
          { text: 'MCP', link: '/en/guide/mcp' },
          { text: 'How it works', link: '/en/guide/how-it-works' },
        ],
        sidebar: enSidebar,
        outline: { level: [2, 3], label: 'On this page' },
        docFooter: { prev: 'Previous', next: 'Next' },
        darkModeSwitchLabel: 'Appearance',
        lightModeSwitchTitle: 'Switch to light theme',
        darkModeSwitchTitle: 'Switch to dark theme',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Back to top',
        langMenuLabel: 'Change language',
        skipToContentLabel: 'Skip to content',
        notFound: {
          title: 'Page not found',
          quote: 'The page you were looking for may have been moved or deleted.',
          linkLabel: 'Back to home',
          linkText: 'Take me home',
        },
        editLink: {
          pattern: 'https://github.com/4fuu/personal-bot/edit/main/site/:path',
          text: 'Edit this page on GitHub',
        },
      },
    },
  },
};
