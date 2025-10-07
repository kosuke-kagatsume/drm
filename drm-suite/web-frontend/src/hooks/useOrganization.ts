import { useState, useEffect } from 'react';

export interface Department {
  id: string;
  name: string;
  parentId: string | null;
  managerId: string | null;
  managerName: string | null;
  memberCount: number;
  children: Department[];
}

export interface Branch {
  id: string;
  name: string;
  departments: Department[];
}

export function useOrganization() {
  const [organization, setOrganization] = useState<Department | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/departments', {
        headers: {
          'X-Tenant-Id': 'default-tenant',
        },
      });
      const data = await response.json();

      if (data.success && data.organization) {
        setOrganization(data.organization);

        // 支店リストを抽出（東京支店、大阪支店）
        const branchList: Branch[] = [];
        const flatDepartments: Department[] = [];

        // 組織をフラット化して全部署を取得
        const flattenDepartments = (dept: Department) => {
          flatDepartments.push(dept);
          dept.children.forEach(child => flattenDepartments(child));
        };

        // 支店レベルの部署を抽出
        data.organization.children.forEach((child: Department) => {
          // 「支店」という名前が含まれる部署を支店として扱う
          if (child.name.includes('支店')) {
            branchList.push({
              id: child.id,
              name: child.name,
              departments: child.children,
            });
          }
          // 全部署をフラット化
          flattenDepartments(child);
        });

        setBranches(branchList);
        setAllDepartments(flatDepartments);
      }
    } catch (err) {
      console.error('組織データの取得に失敗:', err);
      setError('組織データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return {
    organization,
    branches,
    allDepartments,
    loading,
    error,
  };
}
