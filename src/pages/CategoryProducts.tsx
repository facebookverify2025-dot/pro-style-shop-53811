import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface Product {
  id: string;
  name_ar: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stock_quantity: number;
  currency: string;
  discount: number;
}

const categoryNames: Record<string, string> = {
  men: 'ملابس رجالية',
  women: 'ملابس نسائية',
  kids: 'ملابس أطفال',
  accessories: 'إكسسوارات',
};

const CategoryProducts = () => {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    
    // إعداد التحديثات في الوقت الفعلي
    const channel = supabase
      .channel(`category-${category}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {categoryNames[category || ''] || 'المنتجات'}
            </h1>
            <p className="text-muted-foreground">{products.length} منتج</p>
          </div>

          {products.length > 0 && (
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none">
                <Filter className="w-4 h-4 ml-2" />
                فلترة
              </Button>
              <Select defaultValue="newest">
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="price-low">السعر: من الأقل للأعلى</SelectItem>
                  <SelectItem value="price-high">السعر: من الأعلى للأقل</SelectItem>
                  <SelectItem value="popular">الأكثر مبيعاً</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-muted-foreground">
                لا توجد منتجات بعد
              </h2>
              <p className="text-muted-foreground">
                سيتم إضافة المنتجات قريباً
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name_ar}
                price={product.price}
                image={product.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'}
                sizes={product.sizes || []}
                inStock={product.stock_quantity > 0}
                stockQuantity={product.stock_quantity}
                discount={product.discount || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
