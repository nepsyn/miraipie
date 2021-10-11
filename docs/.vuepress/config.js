module.exports = {
    title: 'miraipie',
    base: '/miraipie/',
    description: 'miraipie文档',
    themeConfig: {
        sidebar: [
            {
                title: '入门',
                collapsable: false,
                children: [
                    '/about/about'
                ]
            },
            {
                title: '快速开始',
                collapsable: false,
                children: [
                    '/guide/installation',
                    '/guide/preparation',
                    '/guide/listen',
                    '/guide/basic'
                ]
            },
            {
                title: '进阶',
                collapsable: false,
                children: [
                    '/pro/message',
                    '/pro/events',
                ]
            }
        ],
        nav: [
            { text: 'playground', link: 'https://jsconsole.com/?%3Aload%20https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fmiraipie%40latest%2Fdist%2Fmiraipie.bundle.js' },
            { text: 'Github', link: 'https://github.com/nepsyn/miraipie' },
        ],
        smoothScroll: true,
        sidebarDepth: 2,
        lastUpdated: '最近更新于',
        docsRepo: 'nepsyn/miraipie',
        docsDir: 'docs',
        docsBranch: 'master',
        editLinks: true,
        editLinkText: '发现问题？在 Github 上帮助改善此页'
    },
    plugins: [
        '@vuepress/back-to-top'
    ]
};
