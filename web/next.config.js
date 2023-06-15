// @ts-check

/**
 * @type {import('next').NextConfig}
 **/

// next.config.js
module.exports = require("next-remove-imports")()({
    experimental: { esmExternals: true },
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
})
