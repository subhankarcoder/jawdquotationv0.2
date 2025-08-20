"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuotation } from "@/context/QuotationContext";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { state } = useQuotation();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Quotations</CardTitle></CardHeader>
          <CardContent>{state.items.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Grand Total</CardTitle></CardHeader>
          <CardContent>₹{state.totals.grandTotal.toLocaleString()}</CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
