import { supabase } from "@/integrations/supabase/client";

// Helper functions to bypass TypeScript errors until types are regenerated
export const supabaseClient = {
  from: (table: string) => {
    const tableRef = (supabase as any).from(table);
    return {
      ...tableRef,
      update: (data: any) => tableRef.update(data),
      insert: (data: any) => tableRef.insert(data),
      select: (columns?: string) => tableRef.select(columns),
      delete: () => tableRef.delete(),
    };
  },
  auth: supabase.auth,
  functions: supabase.functions,
};
