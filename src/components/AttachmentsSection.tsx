import React, { useRef, useState } from 'react';
import {
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Film,
  Paperclip,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { TaskAttachment } from '../types';
import { formatJalaliDate, getCurrentJalaliDate, toPersianDigits } from '../lib/jalali';
import { sound } from '../lib/sound';

interface AttachmentsSectionProps {
  attachments: TaskAttachment[];
  onAddAttachment: (attachment: TaskAttachment) => void;
  onDeleteAttachment: (attachmentId: string) => void;
}

export const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  attachments,
  onAddAttachment,
  onDeleteAttachment,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [fileType, setFileType] = useState('image');
  const [previewModalUrl, setPreviewModalUrl] = useState<{ url: string; name: string; type: string } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImage className="w-5 h-5 text-indigo-500" />;
      case 'video':
        return <FileVideo className="w-5 h-5 text-rose-500" />;
      case 'sheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'pdf':
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'code':
        return <FileCode className="w-5 h-5 text-amber-500" />;
      default:
        return <Paperclip className="w-5 h-5 text-slate-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const todayJalali = formatJalaliDate(getCurrentJalaliDate());

    let detectedType = 'file';
    if (file.type.startsWith('image/')) detectedType = 'image';
    else if (file.type.startsWith('video/')) detectedType = 'video';
    else if (file.type.includes('pdf')) detectedType = 'pdf';
    else if (file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) detectedType = 'sheet';
    else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) detectedType = 'doc';

    const objectUrl = URL.createObjectURL(file);

    const newAtt: TaskAttachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: detectedType,
      url: objectUrl,
      uploadedAt: todayJalali,
    };

    onAddAttachment(newAtt);
    sound.playSuccessSound();
    setShowAddForm(false);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const todayJalali = formatJalaliDate(getCurrentJalaliDate());
    const newAtt: TaskAttachment = {
      id: `att-${Date.now()}`,
      name: name.trim(),
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      type: fileType,
      url: url.trim() || '#',
      uploadedAt: todayJalali,
    };

    onAddAttachment(newAtt);
    sound.playSuccessSound();
    setName('');
    setUrl('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-indigo-500" />
          فایل‌های ضمیمه و متریال‌های تبلیغاتی ({toPersianDigits(attachments.length)})
        </h4>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          افزودن ضمیمه
        </button>
      </div>

      {/* Drag & Drop File Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
          isDraggingOver
            ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 scale-[1.01]'
            : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/50 dark:bg-slate-800/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.xlsx,.xls,.csv,.ppt,.pptx,.txt,.zip,.psd,.ai"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <UploadCloud className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-pulse" />
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
          برای آپلود فایل (تصویر، ویدئو، اسناد PDF یا اکسل) کلیک کنید یا فایل را اینجا رها نمایید
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          پشتیبانی از فرمت‌های JPG, PNG, MP4, PDF, DOCX, XLSX و فایل‌های طراحی
        </p>
      </div>

      {/* Manual Link / File Form (Optional) */}
      {showAddForm && (
        <form
          onSubmit={handleManualAdd}
          className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-blue-200 dark:border-blue-900/60 space-y-3 shadow-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              ثبت دستی لینک یا متریال خارجی (گوگل درایو / فیگما)
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 block">
                عنوان فایل یا نام بریف
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: ست استوری بلک فرایدی v2"
                className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 block">
                دسته‌بندی فایل
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="image">تصویر یا بنر (Image/Banner)</option>
                <option value="video">ویدئو یا تیزر تبلیغاتی (Video/Teaser)</option>
                <option value="pdf">سند PDF یا بریف کمپین</option>
                <option value="doc">داکیومنت و متون سناریو (Word/Doc)</option>
                <option value="sheet">اکسل یا داده‌های آماری (Spreadsheet)</option>
                <option value="code">کد یا اسکریپت ردیابی (Tracking/Code)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 block">
              آدرس وب، لینک اشتراکی Google Drive یا Figma (اختیاری)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              dir="ltr"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition"
            >
              ثبت ضمیمه
            </button>
          </div>
        </form>
      )}

      {/* Attachments List */}
      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-0.5">
        {attachments.length === 0 ? (
          <div className="text-center py-6 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Paperclip className="w-7 h-7 mx-auto mb-1.5 opacity-40" />
            <p className="text-xs">هیچ فایل ضمیمه یا آرت‌ورکی برای این وظیفه ثبت نشده است.</p>
          </div>
        ) : (
          attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl hover:border-blue-300 dark:hover:border-blue-700/60 transition shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-700/60 rounded-xl shrink-0">
                  {getFileIcon(att.type)}
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" dir="ltr">
                    {att.name}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    <span>{att.size}</span>
                    <span>•</span>
                    <span>بارگذاری: {toPersianDigits(att.uploadedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Image / Video Preview */}
                {(att.type === 'image' || att.type === 'video') && att.url && att.url !== '#' && (
                  <button
                    type="button"
                    onClick={() => setPreviewModalUrl({ url: att.url, name: att.name, type: att.type })}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition"
                    title="پیش‌نمایش آنلاین"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                {att.url && att.url !== '#' && (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={att.name}
                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition"
                    title="دانلود یا باز کردن"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => onDeleteAttachment(att.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  title="حذف ضمیمه"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal for Images / Videos */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl p-4 max-w-2xl w-full max-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                پیش‌نمایش: {previewModalUrl.name}
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-xl flex items-center justify-center bg-slate-950/5 dark:bg-black/40 w-full p-2">
              {previewModalUrl.type === 'video' ? (
                <video src={previewModalUrl.url} controls className="max-h-[60vh] max-w-full rounded-lg" />
              ) : (
                <img
                  src={previewModalUrl.url}
                  alt={previewModalUrl.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
