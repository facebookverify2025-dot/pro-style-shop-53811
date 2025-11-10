import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  sizes: string[];
  inStock: boolean;
  isNew?: boolean;
  discount?: number;
  stockQuantity?: number;
}

const ProductCard = ({ id, name, price, image, sizes, inStock, isNew, discount, stockQuantity }: ProductCardProps) => {
  const finalPrice = discount ? price - (price * discount / 100) : price;

  return (
    <div className="group product-card-hover bg-product-card rounded-lg overflow-hidden border border-border">
      <Link to={`/product/${id}`} className="block relative">
        <div className="aspect-[3/4] overflow-hidden bg-muted">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-primary text-primary-foreground">
              جديد
            </Badge>
          )}
          {discount && (
            <Badge variant="destructive">
              خصم {discount}%
            </Badge>
          )}
          {!inStock && (
            <Badge variant="secondary">
              نفذ المخزون
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button className="absolute top-3 left-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
          <Heart className="w-4 h-4" />
        </button>
      </Link>

      <div className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          {discount ? (
            <>
              <span className="text-xl font-bold text-primary">
                {finalPrice} ر.س
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {price} ر.س
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-primary">
              {price} ر.س
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-1">
            {sizes.slice(0, 3).map(size => (
              <span 
                key={size}
                className="px-2 py-1 text-xs bg-muted rounded"
              >
                {size}
              </span>
            ))}
          </div>
          {stockQuantity !== undefined && (
            <span className="text-xs text-muted-foreground">
              متبقي: {stockQuantity}
            </span>
          )}
        </div>

        <Button 
          className="w-full" 
          disabled={!inStock}
          asChild={inStock}
        >
          {inStock ? (
            <Link to={`/product/${id}`}>
              <ShoppingCart className="w-4 h-4 ml-2" />
              أضف إلى السلة
            </Link>
          ) : (
            <>نفذ المخزون</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
