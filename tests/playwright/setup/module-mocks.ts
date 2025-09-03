// Module mocks for Node.js environment to handle UI imports

const Module = require('module')
const originalRequire = Module.prototype.require

Module.prototype.require = function (id: string) {
    // Mock SVG imports with Vite's ?react syntax
    if (id.endsWith('.svg?react')) {
        return function SvgMock() {
            return null
        }
    }

    // Mock missing UI dependencies
    if (id === '@redislabsdev/redis-ui-styles') {
        return {}
    }

    return originalRequire.apply(this, arguments)
}

export {}
