/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: "/", destination: "/chats", permanent: true }];
  },
  env: {
    NEXT_PUBLIC_ZEGO_APP_ID: "1704147750",
    NEXT_PUBLIC_ZEGO_SERVER_ID: "f0a8d00c6139416e443406206ee53bad",
  },
};

export default nextConfig;
