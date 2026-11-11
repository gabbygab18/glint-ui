import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PageSwap } from "@/components/page-swap";
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
        {/* Every page sits in one big rounded card, edge-aligned with the floating header.
            overflow-clip (not hidden) keeps sticky sidebars working inside it. */}
        <div className="flex flex-1 flex-col px-2 pb-2 pt-3 sm:px-3 sm:pb-3">
          <div id="main" className="clay flex flex-1 flex-col overflow-clip rounded-[1.75rem] bg-card sm:rounded-[2.5rem]">
            <PageSwap by="section">{children}</PageSwap>
            <Footer />
          </div>
        </div>
      </ToastProvider>
    </>
  );
}
