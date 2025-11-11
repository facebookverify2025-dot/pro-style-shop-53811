import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderData = await req.json();
    
    // Get Telegram credentials from admin settings
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const settingsResponse = await fetch(`${supabaseUrl}/rest/v1/admin_settings?id=eq.1&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    const settings = await settingsResponse.json();
    
    if (!settings || settings.length === 0 || !settings[0].telegram_token || !settings[0].telegram_chat_id) {
      console.log('Telegram not configured, skipping notification');
      return new Response(
        JSON.stringify({ success: false, message: 'Telegram not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const telegramToken = settings[0].telegram_token;
    const chatId = settings[0].telegram_chat_id;

    // Format order details for Telegram
    const itemsList = orderData.items.map((item: any) => 
      `• ${item.name} (${item.color} - ${item.size}) x${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ${orderData.currency}`
    ).join('\n');

    const message = `
🛍️ *طلب جديد!*

📋 *رقم الطلب:* ${orderData.order_number}

👤 *معلومات العميل:*
الاسم: ${orderData.customer_name}
الهاتف: ${orderData.customer_phone}
${orderData.customer_email ? `البريد: ${orderData.customer_email}` : ''}

📍 *عنوان الشحن:*
المدينة: ${orderData.shipping_address.city}
العنوان: ${orderData.shipping_address.address}
${orderData.shipping_address.notes ? `ملاحظات: ${orderData.shipping_address.notes}` : ''}

🛒 *المنتجات:*
${itemsList}

💰 *المجموع الفرعي:* ${orderData.subtotal.toFixed(2)} ${orderData.currency}
🚚 *رسوم الشحن:* ${orderData.shipping_fee.toFixed(2)} ${orderData.currency}
✅ *الإجمالي:* ${orderData.total.toFixed(2)} ${orderData.currency}

${orderData.notes ? `📝 *ملاحظات إضافية:* ${orderData.notes}` : ''}

⏰ *التاريخ:* ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}
    `.trim();

    // Send to Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResult.ok) {
      console.error('Telegram API error:', telegramResult);
      throw new Error('Failed to send Telegram notification');
    }

    console.log('Telegram notification sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-telegram-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});