import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const OrderSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <CheckCircle className="w-24 h-24 mx-auto text-green-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">تم إرسال طلبك بنجاح!</h1>
        <p className="text-muted-foreground mb-8">
          شكراً لك على طلبك. سنتواصل معك قريباً لتأكيد التفاصيل.
        </p>
        <Button size="lg" asChild>
          <Link to="/">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  );
};

export default OrderSuccess;
