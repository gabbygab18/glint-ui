"use client";

import { Table, type TableColumn } from "./table";

type Invoice = { id: string; customer: string; email: string; status: "Paid" | "Pending" | "Overdue"; amount: number; date: string };

const rows: Invoice[] = [
  { id: "INV-1042", customer: "Maya Chen", email: "maya@acme.app", status: "Paid", amount: 1250, date: "2026-09-02" },
  { id: "INV-1043", customer: "Leo Park", email: "leo@northwind.io", status: "Pending", amount: 480, date: "2026-09-04" },
  { id: "INV-1044", customer: "Ines Duarte", email: "ines@lumen.co", status: "Overdue", amount: 2990, date: "2026-08-21" },
  { id: "INV-1045", customer: "Sam Okafor", email: "sam@orbit.dev", status: "Paid", amount: 735, date: "2026-09-11" },
  { id: "INV-1046", customer: "Ava Rossi", email: "ava@fable.studio", status: "Pending", amount: 1640, date: "2026-09-15" },
  { id: "INV-1047", customer: "Noah Berg", email: "noah@pine.so", status: "Paid", amount: 320, date: "2026-09-18" },
  { id: "INV-1048", customer: "Zoe Martin", email: "zoe@kite.app", status: "Overdue", amount: 890, date: "2026-08-30" },
];

const tone = {
  Paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Overdue: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const columns: TableColumn<Invoice>[] = [
  { key: "id", header: "Invoice", sortable: true, cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
  {
    key: "customer",
    header: "Customer",
    sortable: true,
    cell: (r) => (
      <span className="grid leading-tight">
        <span className="font-medium text-foreground">{r.customer}</span>
        <span className="text-xs text-muted-foreground">{r.email}</span>
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tone[r.status]}`}>{r.status}</span>,
  },
  {
    key: "amount",
    header: "Amount",
    sortable: true,
    align: "right",
    cell: (r) => <span className="font-medium text-foreground tabular-nums">${r.amount.toLocaleString("en-US")}</span>,
  },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="w-full max-w-2xl px-4">
      <Table
        columns={columns}
        rows={rows}
        defaultSelected={["INV-1043", "INV-1046"]}
        defaultSort={{ key: "amount", direction: "desc" }}
        maxHeight={340}
        caption="September invoices"
        {...p}
      />
    </div>
  );
}
