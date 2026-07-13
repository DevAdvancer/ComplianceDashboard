"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="text-sm text-slate-400">{label}</div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-sky-200">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-3xl font-semibold text-white">{value}</div>
              <div className="mt-2 text-sm text-slate-400">{hint}</div>
            </div>
            <ArrowUpRight className="size-5 text-emerald-300" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
