import testcafe from 'testcafe';

(async(): Promise<void> => {
    await testcafe()
        .then(t => {
            return t
                .createRunner()
                .compilerOptions({
                    'typescript': {
                        configPath: 'tsconfig.testcafe.json',
                        experimentalDecorators: true
                    } })
                .src((process.env.TEST_FILES || 'tests/web/**/*.e2e.ts').split('\n'))
                .browsers(['chromium:headless --disable-search-engine-choice-screen --ignore-certificate-errors --disable-dev-shm-usage --no-sandbox --retry-test-pages'])
                .screenshots({
                    path: 'report/screenshots/',
                    takeOnFails: true,
                    pathPattern: '${OS}_${BROWSER}/${DATE}_${TIME}/${FIXTURE}_${TEST}_${FILE_INDEX}.png'
                })
                .reporter([
                    'spec',
                    {
                        name: 'xunit',
                        output: './results/results.xml'
                    },
                    {
                        name: 'json',
                        output: './results/e2e.results.json'
                    },
                    {
                        name: 'html',
                        output: './report/index.html'
                    }
                ])
                .run({
                    skipJsErrors: true,
                    browserInitTimeout: 240000,
                    selectorTimeout: 5000,
                    assertionTimeout: 5000,
                    speed: 1,
                    quarantineMode: { successThreshold: 1, attemptLimit: 3 },
                    pageRequestTimeout: 8000,
                    disableMultipleWindows: true
                });
        })
        .then((failedCount) => {
            process.exit(failedCount);
        })
        .catch((e) => {
            console.error(e);
            process.exit(1);
        });
})();
