// Lighthouse CI: runs against the built dist/ and fails CI if a category on these pages drops below 95.
module.exports = {
    ci: {
        collect: {
            staticDistDir: './dist',
            url: [
                'http://localhost/index.html',
                'http://localhost/Products.html',
                'http://localhost/Products/DotNet/Core.html',
                'http://localhost/Documentation/Corda/Flow-Design-Guidelines-1.html',
                'http://localhost/Contact.html',
            ],
            numberOfRuns: 1,
            settings: {
                chromeFlags: '--no-sandbox --headless=new',
            },
        },
        assert: {
            assertions: {
                'categories:performance': ['error', { minScore: 0.95 }],
                'categories:accessibility': ['error', { minScore: 0.95 }],
                'categories:best-practices': ['error', { minScore: 0.95 }],
                'categories:seo': ['error', { minScore: 0.95 }],
            },
        },
        upload: {
            target: 'filesystem',
            outputDir: './.lighthouseci',
        },
    },
};
