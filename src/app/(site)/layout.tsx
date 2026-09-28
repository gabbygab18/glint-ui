import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ToastProvider } from "@/registry/items/toast/toast";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <ToastProvider placement="bottom-right">
        <Header />
        <div id="main" className="flex flex-1 flex-col">
          {children}
        </div>
        <Footer />
      </ToastProvider>
    </>
  );
}
