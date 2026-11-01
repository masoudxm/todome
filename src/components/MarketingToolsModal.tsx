import React, { useState } from 'react';
import {
  Calculator,
  Check,
  Coins,
  Copy,
  ExternalLink,
  Layers,
  Link as LinkIcon,
  Percent,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { toPersianDigits } from '../lib/jalali';
import { sound } from '../lib/sound';

interface MarketingToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarketingToolsModal: React.FC<MarketingToolsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'roas' | 'utm'>('roas');

  // ROAS & CAC Calculator State
  const [adSpend, setAdSpend] = useState<number>(30000000); // 30 million tomans
  const [revenue, setRevenue] = useState<number>(120000000); // 120 million tomans
  const [conversions, setConversions] = useState<number>(150); // 150 leads/customers
  const [cogs, setCogs] = useState<number>(50000000); // product/delivery cost

  // ROAS Calculations
  const roas = adSpend > 0 ? (revenue / adSpend).toFixed(2) : '0';
  const cac = conversions > 0 ? Math.round(adSpend / conversions) : 0;
  const netProfit = revenue - (adSpend + cogs);
  const roi = (adSpend + cogs) > 0 ? (((revenue - (adSpend + cogs)) / (adSpend + cogs)) * 100).toFixed(1) : '0';

  // UTM Builder State
  const [baseUrl, setBaseUrl] = useState('https://rcg-holdings.com/festival');
  const [source, setSource] = useState('yektanet');
  const [medium, setMedium] = useState('cpc');
  const [campaign, setCampaign] = useState('black_friday_1404');
  const [term, setTerm] = useState('crm_software');
  const [content, setContent] = useState('banner_300x250_green');
  const [copied, setCopied] = useState(false);

  const cleanBase = baseUrl.trim() || 'https://rcg-holdings.com';
  const queryParams = new URLSearchParams();
  if (source.trim()) queryParams.set('utm_source', source.trim());
  if (medium.trim()) queryParams.set('utm_medium', medium.trim());
  if (campaign.trim()) queryParams.set('utm_campaign', campaign.trim());
  if (term.trim()) queryParams.set('utm_term', term.trim());
  if (content.trim()) queryParams.set('utm_content', content.trim());

  const generatedUtmUrl = `${cleanBase}${cleanBase.includes('?') ? '&' : '?'}${queryParams.toString()}`;

  const handleCopyUtm = () => {
    navigator.clipboard.writeText(generatedUtmUrl);
    setCopied(true);
    sound.playSuccessSound();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 text-right max-h-[92vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                جعبه‌ابزار تخصصی دیجیتال مارکتینگ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ابزارهای کاربردی محاسبه بازگشت سرمایه تبلیغات و ساخت لینک‌های ترکینگ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('roas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'roas'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            محاسبه بازگشت سرمایه (ROAS & CAC)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('utm')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'utm'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            لینک‌ساز ترکینگ کمپین (UTM Builder)
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {activeTab === 'roas' ? (
            <div className="space-y-4">
              {/* Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    هزینه کل تبلیغات (تومان)
                  </label>
                  <input
                    type="number"
                    step="1000000"
                    value={adSpend}
                    onChange={(e) => setAdSpend(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {toPersianDigits(Math.round(adSpend / 1000000))} میلیون تومان
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    فروش کل حاصل از کمپین (تومان)
                  </label>
                  <input
                    type="number"
                    step="1000000"
                    value={revenue}
                    onChange={(e) => setRevenue(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {toPersianDigits(Math.round(revenue / 1000000))} میلیون تومان
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    تعداد مشتریان یا لیدهای جذب شده
                  </label>
                  <input
                    type="number"
                    value={conversions}
                    onChange={(e) => setConversions(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    بهای تمام‌شده کالا و خدمات (تومان)
                  </label>
                  <input
                    type="number"
                    step="1000000"
                    value={cogs}
                    onChange={(e) => setCogs(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* KPI Results Display */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/50 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                    نرخ بازگشت هزینه تبلیغات (ROAS)
                  </span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {toPersianDigits(roas)}x
                  </span>
                  <span className="text-[9px] text-blue-500 block mt-1">
                    {Number(roas) >= 3 ? '✅ بازدهی عالی' : '⚠️ نیازمند بهینه‌سازی'}
                  </span>
                </div>

                <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                    هزینه جذب هر مشتری (CAC)
                  </span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {toPersianDigits(cac.toLocaleString('fa-IR'))}
                  </span>
                  <span className="text-[9px] text-emerald-500 block mt-1">تومان برای هر خرید</span>
                </div>

                <div className="p-3.5 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                    سود خالص کمپین
                  </span>
                  <span
                    className={`text-lg font-black ${
                      netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                    }`}
                  >
                    {toPersianDigits(Math.round(netProfit / 1000000))} م تومان
                  </span>
                </div>

                <div className="p-3.5 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/30 rounded-2xl border border-purple-200 dark:border-purple-900/50 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                    نرخ بازگشت کل سرمایه‌گذاری (ROI)
                  </span>
                  <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                    {toPersianDigits(roi)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  آدرس لندینگ پیج اصلی (Landing Page URL) *
                </label>
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://rcg-agency.com/campaign"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    منبع کمپین (utm_source)
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    dir="ltr"
                  >
                    <option value="google">google (Google Ads)</option>
                    <option value="yektanet">yektanet (ادنتورک یکتانت)</option>
                    <option value="mediaad">mediaad (مدیااد)</option>
                    <option value="instagram">instagram (اینستاگرام)</option>
                    <option value="linkedin">linkedin (لینکدین)</option>
                    <option value="sms">sms (پیامک انبوه)</option>
                    <option value="newsletter">newsletter (خبرنامه ایمیلی)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    رسانه / فرمت (utm_medium)
                  </label>
                  <select
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    dir="ltr"
                  >
                    <option value="cpc">cpc (تبلیغات کلیکی)</option>
                    <option value="banner">banner (بنر همسان یا ریتارگتینگ)</option>
                    <option value="story">story (استوری اینستاگرام)</option>
                    <option value="post">post (پست سوشال)</option>
                    <option value="email">email (ایمیل مارکتینگ)</option>
                    <option value="influencer">influencer (اینفلوئنسر)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    نام کمپین (utm_campaign)
                  </label>
                  <input
                    type="text"
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                    placeholder="black_friday_1404"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    محتوای تبلیغ (utm_content)
                  </label>
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="banner_300x250_green"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Final Link Output */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  لینک ترکینگ نهایی تولیدشده:
                </span>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-blue-600 dark:text-blue-400 break-all select-all" dir="ltr">
                  {generatedUtmUrl}
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleCopyUtm}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'کپی شد!' : 'کپی لینک ترکینگ'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
