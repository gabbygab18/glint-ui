import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Mascot } from "@/components/mascot";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="grid flex-1 place-items-center px-6 py-24 text-center">
        <div className="flex flex-col items-center">
          <Mascot directions="/mascots/crt-directions.webp" reactions="/mascots/crt-reactions.webp" size={180} label="Glint, the CRT mascot" />
          <h1 className="mt-6 font-display text-6xl font-bold">404</h1>
          <p className="mt-3 text-muted-foreground">This page slipped out of the registry.</p>
          <Link href="/components" className="mt-6 text-sm font-medium text-primary hover:underline">
            Browse components →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
