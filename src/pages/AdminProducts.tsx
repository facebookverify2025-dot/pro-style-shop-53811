import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { supabaseClient } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Plus, Pencil, Trash2, Upload, X } from "lucide-react";

interface Product {
  id: string;
  name_ar: string;
  description_ar: string;
  price: number;
  currency: string;
  category: string;
  stock_quantity: number;
  images: string[];
  sizes: string[];
  colors: string[];
  status: string;
  discount: number;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name_ar: "",
    description_ar: "",
    price: "" as string | number,
    currency: "EGP",
    category: "men",
    stock_quantity: "" as string | number,
    sizes: "",
    colors: "",
    status: "active",
    discount: "" as string | number,
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
      navigate("/");
      return;
    }

    fetchProducts();
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل المنتجات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        newImages.push(data.publicUrl);
      }

      setUploadedImages([...uploadedImages, ...newImages]);
      toast({
        title: "تم الرفع",
        description: "تم رفع الصور بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في رفع الصور",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadedImages.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى رفع صورة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData = {
        name_ar: formData.name_ar,
        description_ar: formData.description_ar,
        price: Number(formData.price),
        currency: formData.currency,
        category: formData.category,
        stock_quantity: Number(formData.stock_quantity),
        images: uploadedImages,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : [],
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : [],
        status: formData.status,
        discount: Number(formData.discount) || 0,
      };

      if (editingProduct) {
        const { error } = await supabaseClient
          .from("products")
          .update(productData as any)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast({ title: "تم التحديث", description: "تم تحديث المنتج بنجاح" });
      } else {
        const { error } = await supabaseClient
          .from("products")
          .insert([productData] as any);

        if (error) throw error;
        toast({ title: "تم الإضافة", description: "تم إضافة المنتج بنجاح" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setUploadedImages(product.images || []);
    setFormData({
      name_ar: product.name_ar,
      description_ar: product.description_ar || "",
      price: product.price,
      currency: product.currency,
      category: product.category,
      stock_quantity: product.stock_quantity,
      sizes: (product.sizes || []).join(', '),
      colors: (product.colors || []).join(', '),
      status: product.status,
      discount: product.discount || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      const { error } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "تم الحذف", description: "تم حذف المنتج بنجاح" });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setUploadedImages([]);
    setFormData({
      name_ar: "",
      description_ar: "",
      price: "",
      currency: "EGP",
      category: "men",
      stock_quantity: "",
      sizes: "",
      colors: "",
      status: "active",
      discount: "",
    });
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
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة منتج جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>صور المنتج</Label>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img src={img} alt={`صورة ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" disabled={uploading} asChild>
                        <span>
                          <Upload className="ml-2 h-4 w-4" />
                          {uploading ? "جاري الرفع..." : "رفع صور"}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_ar">اسم المنتج</Label>
                  <Input
                    id="name_ar"
                    required
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_ar">الوصف</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">السعر</Label>
                    <Input
                      id="price"
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">العملة</Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">التصنيف</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="men">رجالي</SelectItem>
                        <SelectItem value="women">نسائي</SelectItem>
                        <SelectItem value="kids">أطفال</SelectItem>
                        <SelectItem value="accessories">إكسسوارات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">الكمية المتاحة</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      required
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sizes">المقاسات (مفصولة بفاصلة)</Label>
                  <Input
                    id="sizes"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S, M, L, XL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colors">الألوان (مفصولة بفاصلة)</Label>
                  <Input
                    id="colors"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="أسود, أبيض, أزرق"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">الخصم (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {editingProduct ? "تحديث المنتج" : "إضافة المنتج"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center text-muted-foreground">
                لا توجد منتجات حتى الآن
              </CardContent>
            </Card>
          ) : (
            products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name_ar}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.images && product.images.length > 0 && (
                    <img 
                      src={product.images[0]} 
                      alt={product.name_ar}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  )}
                  <div className="space-y-1 text-sm">
                    <p><strong>السعر:</strong> {product.price} {product.currency}</p>
                    {product.discount > 0 && (
                      <p><strong>الخصم:</strong> {product.discount}%</p>
                    )}
                    <p><strong>التصنيف:</strong> {product.category}</p>
                    <p><strong>الكمية:</strong> {product.stock_quantity}</p>
                    <p><strong>الحالة:</strong> {product.status === 'active' ? 'نشط' : 'غير نشط'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="flex-1">
                      <Pencil className="ml-2 h-4 w-4" />
                      تعديل
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)} className="flex-1">
                      <Trash2 className="ml-2 h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
