'use client';

import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface AccountSubject {
  id: string;
  code: string;
  name: string;
  level: 1 | 2 | 3;
  parentCode?: string;
  accountingCode?: string;
  category: 'material' | 'labor' | 'outsourcing' | 'expense';
  isActive: boolean;
}

interface Props {
  value?: {
    id: string;
    code: string;
    name: string;
    category: 'material' | 'labor' | 'outsourcing' | 'expense';
  };
  onChange: (subject: {
    id: string;
    code: string;
    name: string;
    category: 'material' | 'labor' | 'outsourcing' | 'expense';
  }) => void;
  category?: 'material' | 'labor' | 'outsourcing' | 'expense';
}

export default function AccountSubjectSelector({ value, onChange, category }: Props) {
  const [allSubjects, setAllSubjects] = useState<AccountSubject[]>([]);
  const [level1Subjects, setLevel1Subjects] = useState<AccountSubject[]>([]);
  const [level2Subjects, setLevel2Subjects] = useState<AccountSubject[]>([]);
  const [level3Subjects, setLevel3Subjects] = useState<AccountSubject[]>([]);

  const [selectedLevel1, setSelectedLevel1] = useState<string>('');
  const [selectedLevel2, setSelectedLevel2] = useState<string>('');
  const [selectedLevel3, setSelectedLevel3] = useState<string>('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountSubjects();
  }, []);

  useEffect(() => {
    if (allSubjects.length > 0) {
      // カテゴリフィルタがある場合はフィルタリング
      const filtered = category
        ? allSubjects.filter((s) => s.level === 1 && s.category === category && s.isActive)
        : allSubjects.filter((s) => s.level === 1 && s.isActive);

      setLevel1Subjects(filtered);
    }
  }, [allSubjects, category]);

  useEffect(() => {
    if (selectedLevel1) {
      const children = allSubjects.filter(
        (s) => s.level === 2 && s.parentCode === selectedLevel1 && s.isActive
      );
      setLevel2Subjects(children);
      setLevel3Subjects([]);
      setSelectedLevel2('');
      setSelectedLevel3('');
    } else {
      setLevel2Subjects([]);
      setLevel3Subjects([]);
    }
  }, [selectedLevel1, allSubjects]);

  useEffect(() => {
    if (selectedLevel2) {
      const children = allSubjects.filter(
        (s) => s.level === 3 && s.parentCode === selectedLevel2 && s.isActive
      );
      setLevel3Subjects(children);
      setSelectedLevel3('');
    } else {
      setLevel3Subjects([]);
    }
  }, [selectedLevel2, allSubjects]);

  useEffect(() => {
    if (selectedLevel3) {
      const subject = allSubjects.find((s) => s.code === selectedLevel3);
      if (subject) {
        onChange({
          id: subject.id,
          code: subject.code,
          name: subject.name,
          category: subject.category,
        });
      }
    }
  }, [selectedLevel3, allSubjects]);

  // 初期値の設定
  useEffect(() => {
    if (value && allSubjects.length > 0) {
      const subject = allSubjects.find((s) => s.id === value.id);
      if (subject) {
        setSelectedLevel3(subject.code);

        if (subject.parentCode) {
          const level2 = allSubjects.find((s) => s.code === subject.parentCode);
          if (level2) {
            setSelectedLevel2(level2.code);

            if (level2.parentCode) {
              setSelectedLevel1(level2.parentCode);
            }
          }
        }
      }
    }
  }, [value, allSubjects]);

  const fetchAccountSubjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ activeOnly: 'true' });

      const response = await fetch(`/api/admin/account-subjects?${params}`);
      const data = await response.json();

      if (data.success) {
        setAllSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching account subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-sm text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 大分類選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          大分類
        </label>
        <select
          value={selectedLevel1}
          onChange={(e) => setSelectedLevel1(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">選択してください</option>
          {level1Subjects.map((subject) => (
            <option key={subject.id} value={subject.code}>
              {subject.code} - {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* 中分類選択 */}
      {selectedLevel1 && level2Subjects.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            中分類
          </label>
          <select
            value={selectedLevel2}
            onChange={(e) => setSelectedLevel2(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">選択してください</option>
            {level2Subjects.map((subject) => (
              <option key={subject.id} value={subject.code}>
                {subject.code} - {subject.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 小分類選択 */}
      {selectedLevel2 && level3Subjects.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            小分類
          </label>
          <select
            value={selectedLevel3}
            onChange={(e) => setSelectedLevel3(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">選択してください</option>
            {level3Subjects.map((subject) => (
              <option key={subject.id} value={subject.code}>
                {subject.code} - {subject.name}
                {subject.accountingCode && ` (会計コード: ${subject.accountingCode})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 選択済み表示 */}
      {selectedLevel3 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-1">選択中の勘定科目:</div>
          <div className="text-sm text-blue-700">
            {allSubjects.find((s) => s.code === selectedLevel3)?.name}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            コード: {selectedLevel3}
            {allSubjects.find((s) => s.code === selectedLevel3)?.accountingCode && (
              <span className="ml-2">
                (会計コード: {allSubjects.find((s) => s.code === selectedLevel3)?.accountingCode})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
