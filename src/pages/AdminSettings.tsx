import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { supabaseClient } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    store_name: "",
    phone_number: "",
    whatsapp_number: "",
    facebook_url: "",
    instagram_url: "",
    telegram_token: "",
    telegram_chat_id: "",
    shipping_fee: 0,
    default_currency: "EGP",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }

    // التحقق من صلاحيات الإدارة
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحيات الإدارة",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    fetchSettings();
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabaseClient
        .from("admin_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const settingsData = data as any;
        setSettings({
          store_name: settingsData.store_name || "",
          phone_number: settingsData.phone_number || "",
          whatsapp_number: settingsData.whatsapp_number || "",
          facebook_url: settingsData.facebook_url || "",
          instagram_url: settingsData.instagram_url || "",
          telegram_token: settingsData.telegram_token || "",
          telegram_chat_id: settingsData.telegram_chat_id || "",
          shipping_fee: settingsData.shipping_fee || 0,
          default_currency: settingsData.default_currency || "EGP",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabaseClient
        .from("admin_settings")
        .update(settings as any)
        .eq("id", 1);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">إعدادات المتجر</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات المتجر</CardTitle>
              <CardDescription>قم بتحديث معلومات المتجر الأساسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store_name">اسم المتجر</Label>
                <Input
                  id="store_name"
                  value={settings.store_name}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">رقم الهاتف</Label>
                <Input
                  id="phone_number"
                  value={settings.phone_number}
                  onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping_fee">رسوم الشحن</Label>
                <Input
                  id="shipping_fee"
                  type="number"
                  value={settings.shipping_fee}
                  onChange={(e) => setSettings({ ...settings, shipping_fee: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_currency">العملة الافتراضية</Label>
                <Input
                  id="default_currency"
                  value={settings.default_currency}
                  onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })}
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>روابط التواصل الاجتماعي</CardTitle>
              <CardDescription>أضف روابط حساباتك على مواقع التواصل</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">رقم الواتساب</Label>
                <Input
                  id="whatsapp_number"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  placeholder="201234567890"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook_url">رابط الفيسبوك</Label>
                <Input
                  id="facebook_url"
                  value={settings.facebook_url}
                  onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram_url">رابط الانستجرام</Label>
                <Input
                  id="instagram_url"
                  value={settings.instagram_url}
                  onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/yourpage"
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إعدادات التليجرام</CardTitle>
              <CardDescription>لاستقبال إشعارات الطلبات على التليجرام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telegram_token">توكن البوت</Label>
                <Input
                  id="telegram_token"
                  type="password"
                  value={settings.telegram_token}
                  onChange={(e) => setSettings({ ...settings, telegram_token: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram_chat_id">معرف المحادثة</Label>
                <Input
                  id="telegram_chat_id"
                  value={settings.telegram_chat_id}
                  onChange={(e) => setSettings({ ...settings, telegram_chat_id: e.target.value })}
                  dir="ltr"
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
