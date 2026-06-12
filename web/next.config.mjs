/** @type {import('next').NextConfig} */
const nextConfig = {
  // node-ical breaks when bundled; load it as a plain node dependency
  serverExternalPackages: ['node-ical'],
  turbopack: {},
};

export default nextConfig;
