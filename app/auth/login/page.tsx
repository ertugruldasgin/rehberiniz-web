import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Giriş | Rehberiniz",
};

type LoginPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function LoginPage(props: LoginPageProps) {
  const searchParams = await props.searchParams;

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="relative hidden h-full flex-col bg-primary p-10 text-white lg:flex dark:bg-primary">
        {/* Arka plana bir desen veya hafif bir doku atmak istersen buraya ekleyebilirsin */}
        <div className="relative z-20 flex items-center text-lg font-medium tracking-widest uppercase font-mono">
          <div className="mr-2 h-8 w-8 rounded-full bg-white/20" /> Rehberiniz
        </div>
      </div>

      {/* LOGIN */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-87.5">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Oturum Aç</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
