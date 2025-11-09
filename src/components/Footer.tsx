import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase-helpers';

const Footer = () => {
  const [settings, setSettings] = useState({
    facebook_url: '',
    instagram_url: '',
    whatsapp_number: '',
    phone_number: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabaseClient
        .from('admin_settings')
        .select('facebook_url, instagram_url, whatsapp_number, phone_number')
        .eq('id', 1)
        .maybeSingle();
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">متجر Pro</h3>
            <p className="text-muted-foreground mb-4">
              متجرك الأول للأزياء العصرية والملابس عالية الجودة
            </p>
            <div className="flex gap-3">
              {settings.facebook_url && (
                <a 
                  href={settings.facebook_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.instagram_url && (
                <a 
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.whatsapp_number && (
                <a 
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4">التصنيفات</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/categories/men" className="text-muted-foreground hover:text-primary transition-colors">
                  ملابس رجالية
                </Link>
              </li>
              <li>
                <Link to="/categories/women" className="text-muted-foreground hover:text-primary transition-colors">
                  ملابس نسائية
                </Link>
              </li>
              <li>
                <Link to="/categories/kids" className="text-muted-foreground hover:text-primary transition-colors">
                  ملابس أطفال
                </Link>
              </li>
              <li>
                <Link to="/categories/accessories" className="text-muted-foreground hover:text-primary transition-colors">
                  إكسسوارات
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              {settings.phone_number && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{settings.phone_number}</span>
                </li>
              )}
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span dir="ltr">mohamadsalahkamal683@gmail.com</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-1" />
                <span>السادات، مصر</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>جميع الحقوق محفوظة © 2024 متجر Pro</p>
          <p className="text-sm mt-2">
            تطوير: <span className="text-primary font-semibold">محمد صلاح كمال</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
