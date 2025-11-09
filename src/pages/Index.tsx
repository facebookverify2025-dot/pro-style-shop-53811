import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { ShoppingBag, Truck, Shield, Headphones } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface Product {
  id: string;
  name_ar: string;
  price: number;
  images: any[];
  sizes: any[];
  stock_quantity: number;
  status: string;
  currency: string;
}

const Index = () => {
  const { data: products = [], refetch } = useQuery<Product[]>({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return (data || []) as Product[];
    },
  });

  // إعداد التحديثات في الوقت الفعلي للمنتجات
  useEffect(() => {
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-hero py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            مرحباً بك في <span className="text-primary">متجر Pro</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
            أفضل الأزياء العصرية بأسعار مناسبة
          </p>
          <div className="flex gap-4 justify-center animate-slide-up">
            <Button size="lg" asChild>
              <Link to="/products">
                <ShoppingBag className="ml-2 w-5 h-5" />
                تسوق الآن
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/categories/men">
                تصفح التصنيفات
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-featured">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">شحن سريع</h3>
              <p className="text-muted-foreground text-sm">توصيل خلال 2-3 أيام</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">دفع آمن</h3>
              <p className="text-muted-foreground text-sm">معاملات محمية 100%</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">دعم 24/7</h3>
              <p className="text-muted-foreground text-sm">خدمة عملاء متميزة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">جودة عالية</h3>
              <p className="text-muted-foreground text-sm">منتجات مضمونة الجودة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">المنتجات المميزة</h2>
            <Button variant="outline" asChild>
              <Link to="/products">
                عرض الكل
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map(product => (
                <ProductCard 
                  key={product.id} 
                  id={product.id}
                  name={product.name_ar}
                  price={product.price}
                  image={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'}
                  sizes={product.sizes || []}
                  inStock={product.stock_quantity > 0}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">لا توجد منتجات متاحة حالياً</p>
                <Button variant="outline" asChild className="mt-4">
                  <Link to="/admin/products">إضافة منتجات</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Banner */}
      <section className="py-16 px-4 bg-featured">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">تسوق حسب الفئة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              to="/categories/men"
              className="group relative h-64 rounded-lg overflow-hidden"
            >
              <img 
                src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800"
                alt="رجالي"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <h3 className="text-white text-3xl font-bold">ملابس رجالية</h3>
              </div>
            </Link>
            
            <Link 
              to="/categories/women"
              className="group relative h-64 rounded-lg overflow-hidden"
            >
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800"
                alt="نسائي"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <h3 className="text-white text-3xl font-bold">ملابس نسائية</h3>
              </div>
            </Link>
            
            <Link 
              to="/categories/kids"
              className="group relative h-64 rounded-lg overflow-hidden"
            >
              <img 
                src="https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800"
                alt="أطفال"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <h3 className="text-white text-3xl font-bold">ملابس أطفال</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
