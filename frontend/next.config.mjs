/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // enables `next export`
  images: { unoptimized: true } // required for export if you use <Image>
};
export default nextConfig;
