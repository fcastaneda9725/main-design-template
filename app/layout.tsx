import "./globals.css";

// Sin next/font: la tipografía de `styles/tokens.css` (módulo tokens) es
// placeholder (stacks de sistema) hasta que el proyecto ingiera la fuente
// real del cliente (D10, /main-design-tokens). Cuando eso pase, next/font se
// conecta aquí para esa fuente específica — no antes.
//
// Sin ThemeProvider ni next-themes: el kit asume un solo tema por marca, sin
// alternancia claro/oscuro en runtime (D03). El `@custom-variant dark` de
// globals.css sigue declarado a propósito — así cualquier clase `dark:` que
// traiga un componente de shadcn queda neutralizada (nunca se aplica `.dark`
// a nada), en vez de activarse sola por `prefers-color-scheme`.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="font-interface antialiased">
      <body>{children}</body>
    </html>
  );
}
