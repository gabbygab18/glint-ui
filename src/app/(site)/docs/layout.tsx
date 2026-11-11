import { PageSwap } from "@/components/page-swap";
import { Sidebar } from "@/components/sidebar";
import { navRegistry } from "@/registry";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col px-4 sm:px-6 lg:flex-row lg:gap-10">
      <Sidebar entries={navRegistry} />
      <div className="flex min-w-0 flex-1 gap-10">
        <PageSwap>
          <div className="flex min-w-0 flex-1 gap-10">{children}</div>
        </PageSwap>
      </div>
    </div>
  );
}
