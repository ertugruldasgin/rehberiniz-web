import { Label } from "@/components/ui/label";
import { Metadata } from "next";
import React from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Giriş | Rehberiniz",
};

type LoginPageProps = {
  searchParams: Promise<{ message?: string }>;
};

type Institution =
  | { type: "image"; name: string; src: string }
  | { type: "initials"; name: string; initials: string; bgColor: string }
  | { type: "counter"; count: number };

const institutions: Institution[] = [
  {
    type: "image",
    name: "Endpoint Akademi Eğitim Kurumları",
    src: "/images/institutions/logo-1.jpg",
  },
  {
    type: "initials",
    name: "Rehberiniz1",
    initials: "R1",
    bgColor: "bg-blue-500",
  },
  {
    type: "initials",
    name: "Rehberiniz2",
    initials: "R2",
    bgColor: "bg-pink-500",
  },
  {
    type: "initials",
    name: "Rehberiniz3",
    initials: "R3",
    bgColor: "bg-amber-500",
  },
  {
    type: "initials",
    name: "Rehberiniz4",
    initials: "R4",
    bgColor: "bg-rose-500",
  },
  { type: "counter", count: 20 },
];

export default async function LoginPage(props: LoginPageProps) {
  const searchParams = await props.searchParams;

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="relative hidden h-full flex-col bg-background p-6 text-primary-foreground lg:flex">
        <div className="relative z-20 h-full bg-primary rounded-2xl px-8 py-12 flex flex-col justify-between overflow-hidden">
          <div
            className="absolute inset-0 z-0 opacity-[0.07] rounded-2xl"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,1) 39px, rgba(255,255,255,1) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,1) 39px, rgba(255,255,255,1) 40px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative z-10 flex flex-col gap-8 text-primary-foreground">
            <Label className="flex flex-col gap-2 lg:gap-3 xl:gap-4 items-baseline text-primary-foreground font-bold md:text-5xl xl:text-6xl 2xl:text-7xl 3xl:text-8xl tracking-tight">
              <p className="text-primary-foreground/40">Öğrencilerinizin</p>
              <p className="text-primary-foreground/60">Geleceği</p>
              <p className="font-medium italic font-serif text-primary-foreground/80">
                Verilerle
              </p>
              <p className="text-primary-foreground">Şekilleniyor!</p>
            </Label>
          </div>
          <div className="flex flex-col gap-4 relative z-10 bg-card text-card-foreground tracking-tight rounded-xl p-4 lg:p-4 xl:p-6 text-md lg:text-lg xl:text-xl 2xl:text-2xl 3xl:text-3xl font-semibold leading-snug lg:leading-7 xl:leading-9">
            <div>
              <p>
                Kurumunuzun rehberlik sürecini dijitale taşıyın. <br />{" "}
                <span className="font-serif font-bold italic text-primary">
                  Veriye{" "}
                </span>
                dayalı kararlar, daha{" "}
                <span className="font-serif font-bold italic text-primary">
                  başarılı{" "}
                </span>
                öğrenciler.
              </p>
            </div>

            <div className="flex items-center justify-end mt-4 gap-1">
              <span className="text-xs text-muted-foreground font-medium mr-2">
                Bize güvenen kurumlar
              </span>
              <div className="flex -space-x-3">
                {institutions.map((inst, i) => {
                  const name =
                    inst.type === "counter"
                      ? `ve ${inst.count}+ kurum daha`
                      : inst.name;

                  const tooltip = (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-accent px-3 text-[12px] font-medium tracking-normal text-accent-foreground opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                      {name}
                    </span>
                  );

                  if (inst.type === "image") {
                    return (
                      <div
                        key={inst.name}
                        className="group relative hover:z-50 transition-transform hover:scale-110 cursor-pointer"
                      >
                        {tooltip}
                        <img
                          src={inst.src}
                          alt={inst.name}
                          className="w-9 h-9 rounded-full border-2 border-card object-cover"
                        />
                      </div>
                    );
                  }

                  if (inst.type === "counter") {
                    return (
                      <div
                        key="counter"
                        className="group relative hover:z-50 transition-transform hover:scale-110 cursor-pointer"
                      >
                        {tooltip}
                        <div className="w-9 h-9 rounded-full border-2 border-card bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                          +{inst.count}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={inst.name}
                      className="group relative hover:z-50 transition-transform hover:scale-110 cursor-pointer"
                    >
                      {tooltip}
                      <div
                        className={`w-9 h-9 rounded-full border-2 border-card ${inst.bgColor} flex items-center justify-center text-[10px] font-bold text-white`}
                      >
                        {inst.initials}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-card">
        <LoginForm errorMessage={searchParams?.message} />
      </div>
    </div>
  );
}
