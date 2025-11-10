import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name_ar: string;
  price: number;
  images: any[];
  sizes: any[];
  stock_quantity: number;
  status: string;
  currency: string;
  discount: number;
}

const Products = () => {
  const { data: products = [], refetch } = useQuery<Product[]>({
    queryKey: ['all-products'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Product[];
    },
  });

  // إعداد التحديثات في الوقت الفعلي للمنتجات
  useEffect(() => {
    const channel = supabase
      .channel('all-products-changes')
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
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">جميع المنتجات</h1>
            <p className="text-muted-foreground">{products.length} منتج</p>
          </div>

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
                stockQuantity={product.stock_quantity}
                discount={product.discount || 0}
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
    </div>
  );
};

export default Products;
