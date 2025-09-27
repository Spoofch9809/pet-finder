/** @type {import('next').NextConfig} */
const nextConfig = {         // enables `next export`
  images: { unoptimized: true } // required for export if you use <Image>
};
export default nextConfig;
