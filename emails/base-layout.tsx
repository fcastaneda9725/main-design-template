// kit: email@1
import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "react-email";
import tokens from "@/design-system/tokens.json";

// Plantilla base de todos los correos: bilingüe, 600px, sin depender de
// fuentes web (los clientes de correo no cargan Google Fonts de forma
// confiable, así que se usa la pila de fallback del sistema). Los clientes de
// correo tampoco soportan `var(--...)` de forma confiable — por eso los
// valores salen de tokens.json ya resueltos, nunca de styles/tokens.css.
const paper = tokens.color.paper;

type BaseEmailLayoutProps = {
  locale: string;
  previewText: string;
  brandName: string;
  footerNote: string;
  children: React.ReactNode;
};

export function BaseEmailLayout({
  locale,
  previewText,
  brandName,
  footerNote,
  children,
}: BaseEmailLayoutProps) {
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: paper.bgAlt, margin: 0, padding: "32px 0" }}>
        <Container
          style={{
            backgroundColor: paper.bg,
            maxWidth: "600px",
            margin: "0 auto",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          <Section style={{ padding: "32px 40px 0" }}>
            <Text
              style={{
                fontSize: "11px",
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: paper.accentInk,
                margin: 0,
              }}
            >
              {brandName}
            </Text>
            <Hr style={{ borderColor: paper.accentRule, margin: "12px 0 24px" }} />
          </Section>

          <Section style={{ padding: "0 40px" }}>{children}</Section>

          <Section style={{ padding: "24px 40px 32px" }}>
            <Hr style={{ borderColor: paper.border, margin: "0 0 16px" }} />
            <Text style={{ fontSize: "12px", lineHeight: 1.6, color: paper.muted, margin: 0 }}>
              {footerNote}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
