import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Plus,
  Printer,
  Share2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { MarketingReport, Task, UserProfile } from '../types';
import { getCurrentJalaliDate, formatJalaliDate, toPersianDigits } from '../lib/jalali';

interface PeriodicReportsProps {
  tasks: Task[];
  reports: MarketingReport[];
  currentUser: UserProfile;
  onSaveReport: (report: MarketingReport) => void;
  onRequestExportToSheets: (report: MarketingReport) => void;
}

export const PeriodicReports: React.FC<PeriodicReportsProps> = ({
  tasks,
  reports,
  currentUser,
  onSaveReport,
  onRequestExportToSheets,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'campaign'>('weekly');
  const [reportTitle, setReportTitle] = useState('');
  const [reportSummary, setReportSummary] = useState('');
  const [achievementsInput, setAchievementsInput] = useState('');
  const [challengesInput, setChallengesInput] = useState('');
  const [nextStepsInput, setNextStepsInput] = useState('');

  const todayJalali = formatJalaliDate(getCurrentJalaliDate());

  // Auto-calculated Metrics from tasks
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalActualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const periodLabels: Record<string, string> = {
      daily: 'گزارش روزانه',
      weekly: 'گزارش هفتگی',
      monthly: 'گزارش ماهانه',
      campaign: 'گزارش عملکرد کمپین',
    };

    const finalTitle = reportTitle.trim() || `${periodLabels[selectedPeriod]} واحد مارکتینگ - ${todayJalali}`;

    const newReport: MarketingReport = {
      id: `rep-${Date.now()}`,
      title: finalTitle,
      period: selectedPeriod,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.title,
      dateRange: todayJalali,
      metrics: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        completionRate,
        totalEstimatedHours,
        totalActualHours,
      },
      summary: reportSummary.trim() || `در این دوره، تعداد ${completedTasks.length} وظیفه با نرخ تکمیل ${completionRate}٪ با موفقیت به پایان رسید. تیم تمرکز خود را بر ارتقای نرخ تبدیل کمپین‌های ادز و بهبود سئو متمرکز نمود.`,
      achievements: achievementsInput.split('\n').filter((s) => s.trim().length > 0),
      challenges: challengesInput.split('\n').filter((s) => s.trim().length > 0),
      nextSteps: nextStepsInput.split('\n').filter((s) => s.trim().length > 0),
      createdAt: todayJalali,
    };

    onSaveReport(newReport);
    setShowCreateModal(false);
    setReportTitle('');
    setReportSummary('');
    setAchievementsInput('');
    setChallengesInput('');
    setNextStepsInput('');
  };

  const handleDownloadCsv = (report: MarketingReport) => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      `عنوان گزارش,${report.title}\n` +
      `دوره,${report.period}\n` +
      `تهیه کننده,${report.authorName}\n` +
      `بازه زمانی,${report.dateRange}\n` +
      `کل وظایف,${report.metrics.totalTasks}\n` +
      `وظایف تکمیل شده,${report.metrics.completedTasks}\n` +
      `نرخ بازدهی,${report.metrics.completionRate}%\n` +
      `ساعت تخمینی,${report.metrics.totalEstimatedHours}\n` +
      `ساعت واقعی,${report.metrics.totalActualHours}\n\n` +
      `فهرست وظایف مرتبط:\n` +
      `عنوان,دسته‌بندی,اولویت,وضعیت,مسئول,سررسید\n` +
      tasks
        .map(
          (t) =>
            `"${t.title.replace(/"/g, '""')}","${t.category}","${t.priority}","${t.status}","${t.assigneeName}","${t.jalaliDueDate}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RCG_Report_${report.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
            گزارش‌دهی دوره‌ای به مدیریت ارشد تیم مارکتینگ
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تولید و ثبت گزارش‌های دوره‌ای روزانه، هفتگی و ماهانه به همراه خروجی مستقیم به Google Sheets
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          تنظیم گزارش دوره‌ای جدید
        </button>
      </div>

      {/* Reports Feed */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              هنوز هیچ گزارش دوره‌ای ثبت نشده است
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              با کلیک بر روی دکمه بالا می‌توانید عملکرد این دوره تیم تبلیغات را تجمیع کرده و به مدیریت ارائه دهید.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
            >
              ایجاد اولین گزارش دوره‌ای
            </button>
          </div>
        ) : (
          reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 hover:border-emerald-400 dark:hover:border-emerald-800/80 transition"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {rep.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {rep.period === 'weekly'
                          ? 'هفتگی'
                          : rep.period === 'monthly'
                          ? 'ماهانه'
                          : rep.period === 'daily'
                          ? 'روزانه'
                          : 'کمپین'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ارائه شده توسط: {rep.authorName} • تاریخ: {toPersianDigits(rep.dateRange)}
                    </p>
                  </div>
                </div>

                {/* Actions: Export to Google Sheets, CSV, Print */}
                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <button
                    type="button"
                    onClick={() => onRequestExportToSheets(rep)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl transition"
                    title="ارسال مستقیم به Google Sheets"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    خروجی به گوگل شیت
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadCsv(rep)}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                    title="دانلود فایل CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                    title="چاپ یا ذخیره PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Metrics strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl">
                <div>
                  <span className="text-[11px] text-slate-400 block">کل وظایف دوره</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {toPersianDigits(rep.metrics.totalTasks)} کار
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">تکمیل شده</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {toPersianDigits(rep.metrics.completedTasks)} کار
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">نرخ بازدهی</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {toPersianDigits(rep.metrics.completionRate)}%
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">ساعات صرف شده</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {toPersianDigits(rep.metrics.totalActualHours)} از {toPersianDigits(rep.metrics.totalEstimatedHours)} س
                  </span>
                </div>
              </div>

              {/* Summary text */}
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {rep.summary}
              </div>

              {rep.sheetsUrl && (
                <div className="pt-2">
                  <a
                    href={rep.sheetsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    مشاهده سند تحلیل شده در Google Sheets
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 text-right max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              تنظیم و ارسال گزارش دوره‌ای به مدیر تیم
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              شاخص‌های آماری به صورت خودکار بر اساس تسک‌های جاری استخراج شده‌اند.
            </p>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  دوره گزارش
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'daily', label: 'روزانه' },
                    { key: 'weekly', label: 'هفتگی' },
                    { key: 'monthly', label: 'ماهانه' },
                    { key: 'campaign', label: 'کمپین' },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setSelectedPeriod(p.key as any)}
                      className={`p-2 text-xs font-bold rounded-xl border transition ${
                        selectedPeriod === p.key
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  عنوان گزارش
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder={`گزارش دوره ${todayJalali}`}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  شرح و تحلیل دستاوردها برای مدیریت
                </label>
                <textarea
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                  placeholder="خلاصه اقدامات کلیدی، نقاط قوت، نتایج حاصل از تبلیغات و بازخوردها..."
                  rows={4}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  ثبت و ذخیره گزارش
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
