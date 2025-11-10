import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Minus, Plus, ChevronLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name_ar: string;
  description_ar: string;
  price: number;
  currency: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock_quantity: number;
  category: string;
  discount: number;
}

const ProductDetails = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
      if (data.colors && data.colors.length > 0) {
        setSelectedColor(data.colors[0]);
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المنتج',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      toast({
        title: 'تنبيه',
        description: 'الرجاء اختيار المقاس',
        variant: 'destructive',
      });
      return;
    }

    const finalPrice = product.discount 
      ? product.price - (product.price * product.discount / 100) 
      : product.price;

    addItem({
      id: '',
      productId: product.id,
      name: product.name_ar,
      price: finalPrice,
      size: selectedSize,
      color: selectedColor,
      quantity,
      image: product.images[0],
    });

    toast({
      title: 'تمت الإضافة بنجاح',
      description: 'تم إضافة المنتج إلى سلة التسوق',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">المنتج غير موجود</p>
          <Button asChild>
            <Link to="/products">العودة للمنتجات</Link>
          </Button>
        </div>
      </div>
    );
  }

  const finalPrice = product.discount 
    ? product.price - (product.price * product.discount / 100) 
    : product.price;

  const inStock = product.stock_quantity > 0;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <Link to="/products" className="hover:text-primary">المنتجات</Link>
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span className="text-foreground">{product.name_ar}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img 
                src={product.images[selectedImage] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'} 
                alt={product.name_ar}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${product.name_ar} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-3">{product.category}</Badge>
              <h1 className="text-3xl font-bold mb-3">{product.name_ar}</h1>
              <div className="flex items-center gap-3 mb-4">
                {product.discount > 0 ? (
                  <>
                    <div className="text-3xl font-bold text-primary">
                      {finalPrice.toFixed(2)} {product.currency}
                    </div>
                    <div className="text-xl text-muted-foreground line-through">
                      {product.price} {product.currency}
                    </div>
                    <Badge variant="destructive">
                      خصم {product.discount}%
                    </Badge>
                  </>
                ) : (
                  <div className="text-3xl font-bold text-primary">
                    {product.price} {product.currency}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                متبقي: {product.stock_quantity} قطعة
              </p>
            </div>

            {product.description_ar && (
              <div className="prose prose-sm">
                <p className="text-muted-foreground">{product.description_ar}</p>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">اللون</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                        selectedColor === color
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">المقاس</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">الكمية</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingCart className="w-5 h-5 ml-2" />
                أضف إلى السلة
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {!inStock && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-destructive font-medium">هذا المنتج غير متوفر حالياً</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
