/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gera um servidor mínimo em .next/standalone, o que mantém a imagem Docker
  // pequena sem precisar do node_modules completo em runtime.
  output: "standalone",
  reactStrictMode: true,
  images: {
    // As ilustrações das metas são URLs informadas pelo usuário.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  async headers() {
    return [
      {
        // O HTML nunca é cacheado pelo navegador.
        //
        // Os arquivos JavaScript têm hash no nome e mudam a cada build. Se o
        // navegador reaproveitar um HTML antigo, ele pede chunks que não
        // existem mais e a aplicação quebra com uma exceção genérica logo na
        // primeira interação — sintoma idêntico ao de um bug de código.
        // Revalidar o documento a cada visita elimina esse cenário.
        source: "/:path((?!_next/static).*)",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
