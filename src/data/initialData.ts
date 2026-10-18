import { Product, PaymentAccounts, ProductReview } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'NordVPN Premium (1 Year Private)',
    description: 'မြန်နှုန်းမြင့် လုံခြုံစိတ်ချရသော NordVPN အကောင့်သီးသန့် (PC, Android, iOS အသုံးပြုနိုင်)',
    price: 18000,
    category: 'VPN & Proxy',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    active: true,
    stock: 3,
    download_link: 'https://mega.nz/file/nordvpn-account-guide-linhtet\nUser: linhtet.nord@gmail.com\nPass: SecPass#2026'
  },
  {
    id: 'b1ffcd88-8d1a-4fe9-aa5c-5aa8ac270b22',
    name: 'Canva Pro Lifetime (Own Gmail)',
    description: 'မိမိကိုယ်ပိုင် Gmail ဖြင့် Canva Pro Brand Kit, Templates, Magic Studio အကုန်သုံးနိုင်သည်',
    price: 12000,
    category: 'Graphic & Design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    active: true,
    stock: 18,
    download_link: 'https://canva.com/brand/join?invite_token=CANVA-PRO-LINHTET-TEAM-ACCESS'
  },
  {
    id: 'c2eedc77-7c2b-4ed8-bb4b-4bb7ab160c33',
    name: 'Windows 11 Pro Genuine Retail Key',
    description: 'Microsoft Official Online Activation Key (Re-install ပြန်လုပ်၍ရသော Lifetime Key)',
    price: 15000,
    category: 'OS & Software',
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80',
    active: true,
    stock: 2,
    download_link: 'VK7JG-NPHTM-C97JM-9MPGT-3V66T (Lin Htet Retail License)'
  },
  {
    id: 'd3ddcb66-6b3c-4dc7-cc3a-3aa6ba050d44',
    name: 'Telegram Premium 3 Months Gift',
    description: 'ကြယ်ပွင့် Badge, 4GB Upload, Fast Download, Voice-to-Text ပါဝင်သော ၃ လစာ လက်ဆောင်',
    price: 32000,
    category: 'Social & Tools',
    image: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=600&q=80',
    active: true,
    stock: 4,
    download_link: 'https://t.me/giftcode?link=tgprem-linhtet-gift-3mo-valid'
  },
  {
    id: 'e4ccba55-5a4d-4cb6-dd29-2995a9f40e55',
    name: 'ChatGPT Plus Shared Account (1 Month)',
    description: 'GPT-4o, DALL-E 3, Canvas, Code Interpreter အသုံးပြုနိုင်သော လစဉ်အကောင့်',
    price: 22000,
    category: 'AI Tools',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80',
    active: true,
    stock: 2,
    download_link: 'Login Portal: https://ai-portal.linhtet.com\nUser: linhtet_gpt_user04\nPin: 8892'
  },
  {
    id: 'f5bba944-495e-4ba5-ee18-188498e30f66',
    name: 'CapCut Pro 1 Year (PC & Mobile)',
    description: 'Watermark မပါ၊ Pro Effects, Auto Captions, 4K 60fps Export အပြည့်အစုံသုံးနိုင်သည်',
    price: 25000,
    category: 'Video Editing',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
    active: true,
    stock: 12,
    download_link: 'https://drive.google.com/drive/folders/capcut-pro-linhtet-vip-installer'
  },
  {
    id: '06aa9833-386f-4a94-ff07-077387d20a77',
    name: 'YouTube Premium 6 Months (Family Slot)',
    description: 'ကြော်ငြာလုံးဝမပါ၊ Background Play, YouTube Music ပါဝင်သော ၆ လစာ အသုံးပြုခွင့်',
    price: 16000,
    category: 'Streaming & Music',
    image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=600&q=80',
    active: true,
    stock: 3,
    download_link: 'https://families.google.com/join/linhtet-yt-premium-invite-batch6'
  },
  {
    id: '17998722-277e-4983-ee96-966276c10b88',
    name: 'Spotify Premium 6 Months Invite',
    description: 'High Quality Audio, Offline Download, ကြော်ငြာမပါသော Spotify Family slot',
    price: 15000,
    category: 'Streaming & Music',
    image: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?auto=format&fit=crop&w=600&q=80',
    active: true,
    stock: 8,
    download_link: 'https://www.spotify.com/family/join/invite/linhtet-spotify-slot9'
  }
];

export const DEFAULT_PAYMENT_ACCOUNTS: PaymentAccounts = {
  KPay: {
    name: 'Lin Htet (လင်းထက်)',
    number: '09-777123456'
  },
  WavePay: {
    name: 'Lin Htet (လင်းထက်)',
    number: '09-777123456'
  },
  KBZ_Bank: {
    name: 'U Lin Htet',
    number: '0483019990123456'
  },
  AYAPay: {
    name: 'Lin Htet IT Service',
    number: '09-777123456'
  }
};

export const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-001',
    productId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    productName: 'NordVPN Premium (1 Year Private)',
    rating: 5,
    customerName: 'Ko Kyaw Zin (ကိုကျော်ဇင်)',
    comment: 'မြန်နှုန်းအရမ်းကောင်းပါတယ်! PC ရော ဖုန်းရော အဆင်ပြေပြေ ချိတ်ရပါတယ်။ ပို့ပေးတဲ့ download guide အတိုင်းလုပ်တာ ချက်ချင်းသုံးလို့ရသွားတယ်။ စိတ်ချရတဲ့ service ပါ။',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    verifiedPurchase: true,
    orderNo: 'LH-100234',
    helpfulCount: 6
  },
  {
    id: 'rev-002',
    productId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    productName: 'NordVPN Premium (1 Year Private)',
    rating: 5,
    customerName: 'Aung Myo Htet',
    comment: 'Ping နည်းပြီး Game ကစားရတာ လိုင်းငြိမ်တယ်။ Server အများကြီးချိတ်ရလို့ အရမ်းတန်ပါတယ်။',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    verifiedPurchase: true,
    helpfulCount: 4
  },
  {
    id: 'rev-003',
    productId: 'b1ffcd88-8d1a-4fe9-aa5c-5aa8ac270b22',
    productName: 'Canva Pro Lifetime (Own Gmail)',
    rating: 5,
    customerName: 'Ma Su Myat (မစုမြတ်)',
    comment: 'ကိုယ်ပိုင် Gmail ထဲကို ချက်ချင်း Brand Kit Invite ရောက်လာတယ်။ Template တွေအစုံသုံးလို့ရပါပြီ။ ကျေးဇူးအများကြီးတင်ပါတယ် Admin ရှင့်။',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    verifiedPurchase: true,
    orderNo: 'LH-100248',
    helpfulCount: 9
  },
  {
    id: 'rev-004',
    productId: 'b1ffcd88-8d1a-4fe9-aa5c-5aa8ac270b22',
    productName: 'Canva Pro Lifetime (Own Gmail)',
    rating: 5,
    customerName: 'Thura Aung (သူရအောင်)',
    comment: 'AI Magic Studio ရော Magic Eraser ရော အကုန်သုံးရတယ်။ ဒီဈေးနဲ့ တကယ်တန်ပါတယ်! နောက်လည်း ထပ်အားပေးပါဦးမယ်။',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    verifiedPurchase: true,
    helpfulCount: 3
  },
  {
    id: 'rev-005',
    productId: 'c2eedc77-7c2b-4ed8-bb4b-4bb7ab160c33',
    productName: 'Windows 11 Pro Genuine Retail Key',
    rating: 5,
    customerName: 'U Zaw Win',
    comment: 'Microsoft official activation settings ထဲမှာ Key ရိုက်ထည့်လိုက်တာနဲ့ ချက်ချင်း Activated ဖြစ်သွားပါတယ်။ Genuine Retail Key စစ်စစ်ပါ။',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    verifiedPurchase: true,
    orderNo: 'LH-100219',
    helpfulCount: 7
  },
  {
    id: 'rev-006',
    productId: 'd3ddcb66-6b3c-4dc7-cc3a-3aa6ba050d44',
    productName: 'Telegram Premium 3 Months Gift',
    rating: 5,
    customerName: 'Wai Yan',
    comment: 'Gift link ကလစ်လိုက်တာနဲ့ Star badge ချက်ချင်းရသွားတယ်။ Fast download လည်း တကယ်ရပါတယ် bro။ စိတ်ချလက်ချဝယ်လို့ရတယ်။',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    verifiedPurchase: true,
    helpfulCount: 5
  },
  {
    id: 'rev-007',
    productId: 'e4ccba55-5a4d-4cb6-dd29-2995a9f40e55',
    productName: 'ChatGPT Plus Shared Account (1 Month)',
    rating: 5,
    customerName: 'Htet Aung',
    comment: 'GPT-4o နဲ့ DALL-E 3 သုံးလို့ကောင်းတယ်၊ Prompt run တာ အရမ်းမြန်တယ်။ Portal login ကလည်း ရှင်းပါတယ်။',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    verifiedPurchase: true,
    helpfulCount: 8
  },
  {
    id: 'rev-008',
    productId: 'f5bba944-495e-4ba5-ee18-188498e30f66',
    productName: 'CapCut Pro 1 Year (PC & Mobile)',
    rating: 5,
    customerName: 'Zin Phyo',
    comment: 'Auto Captions မြန်မာစာနဲ့ရော အင်္ဂလိပ်စာရော export ထုတ်ရတာ အဆင်ပြေတယ်။ Watermark မပါတော့ ဗီဒီယို edit လုပ်တဲ့သူတွေအတွက် မရှိမဖြစ်ပါပဲ။',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    verifiedPurchase: true,
    helpfulCount: 11
  }
];

