import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// 日付フォーマット (例: 2026年04月01日(水) 14:00)
export const formatDateTime = (dateObj) => {
  if (!dateObj) return '';
  // FirestoreのTimestamp型の場合はDate型に変換
  const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
  return format(date, 'yyyy年MM月dd日(eee) HH:mm', { locale: ja });
};

// 短い日付 (例: 04/01 14:00)
export const formatShortDate = (dateObj) => {
  if (!dateObj) return '';
  const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
  return format(date, 'MM/dd(eee) HH:mm', { locale: ja });
};

// 金額フォーマット (例: ¥5,000)
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(amount);
};