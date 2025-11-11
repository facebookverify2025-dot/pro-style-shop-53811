import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

const WelcomeMessage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setIsVisible(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-md border-2 border-primary rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-fade-in relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4"
          onClick={() => setIsVisible(false)}
        >
          <X className="w-5 h-5" />
        </Button>
        
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-primary mb-4">
            مرحباً بك في متجر برو
          </h2>
          <p className="text-2xl font-semibold text-foreground">
            من مجموعة النواوي جروب
          </p>
          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-6 border border-border space-y-4">
            <div>
              <p className="text-lg text-muted-foreground mb-1">
                المدير التنفيذي
              </p>
              <p className="text-xl font-bold text-foreground">
                زياد رشاد
              </p>
            </div>
            <div>
              <p className="text-lg text-muted-foreground mb-1">
                رئيس مجلس الإدارة
              </p>
              <p className="text-xl font-bold text-foreground">
                محمد صلاح كمال
              </p>
            </div>
          </div>
          <Button 
            size="lg" 
            className="mt-6"
            onClick={() => setIsVisible(false)}
          >
            ابدأ التسوق الآن
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;
