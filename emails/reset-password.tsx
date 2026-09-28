// kit: email@1
import { Button, Heading, Text } from "react-email";
import tokens from "@/design-system/tokens.json";
import { BaseEmailLayout } from "./base-layout";

const paper = tokens.color.paper;

export type ResetPasswordEmailProps = {
  resetUrl: string;
  brandName: string;
  locale?: string;
};

export function ResetPasswordEmail({
  resetUrl,
  brandName,
  locale = "es",
}: ResetPasswordEmailProps) {
  return (
    <BaseEmailLayout
      locale={locale}
      brandName={brandName}
      previewText="Recupera tu contraseña"
      footerNote="Si no solicitaste este cambio, ignora este correo — tu contraseña sigue igual."
    >
      <Heading as="h1" style={{ fontSize: "20px", lineHeight: 1.3, color: paper.ink, margin: "0 0 8px" }}>
        Recupera tu contraseña
      </Heading>
      <Text style={{ fontSize: "14px", lineHeight: 1.6, color: paper.body, margin: "0 0 24px" }}>
        Recibimos una solicitud para restablecer tu contraseña. Haz clic en el
        botón para crear una nueva.
      </Text>
      <Button
        href={resetUrl}
        style={{
          backgroundColor: paper.accentInk,
          color: paper.bg,
          fontSize: "14px",
          fontWeight: 600,
          textDecoration: "none",
          padding: "12px 24px",
          borderRadius: "6px",
          display: "inline-block",
        }}
      >
        Restablecer contraseña
      </Button>
    </BaseEmailLayout>
  );
}

export default ResetPasswordEmail;
