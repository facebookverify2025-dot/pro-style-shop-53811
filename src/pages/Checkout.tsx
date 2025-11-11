import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().trim().min(1, "الاسم مطلوب").max(100, "الاسم يجب أن يكون أقل من 100 حرف"),
  phone: z.string().trim().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل").max(20, "رقم الهاتف طويل جداً"),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح").max(255).optional().or(z.literal("")),
  city: z.string().trim().min(1, "المدينة مطلوبة").max(100, "اسم المدينة طويل جداً"),
  address: z.string().trim().min(1, "العنوان مطلوب").max(500, "العنوان طويل جداً"),
  notes: z.string().max(1000, "الملاحظات طويلة جداً").optional(),
});

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validationResult = checkoutSchema.safeParse(formData);
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        throw new Error(firstError.message);
      }

      const validatedData = validationResult.data;
      const orderNumber = `ORD-${Date.now()}`;
      const { data: settings } = await supabase.from("admin_settings").select("*").eq("id", 1).maybeSingle();
      
      const settingsData = settings as any;
      const shippingFee = settingsData?.shipping_fee ?? 0;
      const currency = settingsData?.default_currency ?? "EGP";
      
      const orderData = {
        order_number: orderNumber,
        customer_name: validatedData.name,
        customer_phone: validatedData.phone,
        customer_email: validatedData.email || null,
        items: items,
        subtotal: total,
        shipping_fee: shippingFee,
        total: total + shippingFee,
        currency: currency,
        shipping_address: { 
          city: validatedData.city, 
          address: validatedData.address, 
          notes: validatedData.notes || "" 
        },
        status: "new",
        notes: validatedData.notes || null,
      };

      const { error } = await supabase.from("orders").insert([orderData] as any);
      if (error) throw error;

      await supabase.functions.invoke("send-telegram-notification", { body: orderData });

      clearCart();
      navigate("/order-success");
      toast({ title: "تم إرسال الطلب بنجاح" });
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input id="phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">المدينة</Label>
            <Input id="city" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Textarea id="address" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "جاري الإرسال..." : `تأكيد الطلب - ${total} ر.س`}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
