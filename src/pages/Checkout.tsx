import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { supabaseClient } from "@/lib/supabase-helpers";

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
      const orderNumber = `ORD-${Date.now()}`;
      const { data: settings } = await supabaseClient.from("admin_settings").select("*").eq("id", 1).maybeSingle();
      
      const settingsData = settings as any;
      const shippingFee = settingsData?.shipping_fee ?? 0;
      const currency = settingsData?.default_currency ?? "EGP";
      
      const orderData = {
        order_number: orderNumber,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        items: items,
        subtotal: total,
        shipping_fee: shippingFee,
        total: total + shippingFee,
        currency: currency,
        shipping_address: { city: formData.city, address: formData.address, notes: formData.notes },
        status: "new",
        notes: formData.notes,
      };

      const { error } = await supabaseClient.from("orders").insert([orderData] as any);
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
