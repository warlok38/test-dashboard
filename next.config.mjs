/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    runMode: process.env.RUN_MODE || 'production',
    kerbToken: process.env.KERB_TOKEN || undefined
  }
}

export default nextConfig
