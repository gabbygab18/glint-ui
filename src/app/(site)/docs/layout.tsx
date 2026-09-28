import { Sidebar } from "@/components/sidebar";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col px-4 sm:px-6 lg:flex-row lg:gap-10">
      <Sidebar />
      <div className="flex min-w-0 flex-1 gap-10">{children}</div>
    </div>
  );
}
