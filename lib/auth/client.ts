// kit: auth@1
"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// adminClient() empareja al plugin admin() del servidor (server.ts) — sin él,
// useSession() sigue funcionando pero pierde los métodos y el tipado de
// role/banned/banExpires del lado cliente.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
