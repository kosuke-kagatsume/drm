import { NextRequest, NextResponse } from 'next/server';
import type { VersionDiff, FinancialItem } from '@/types/financial-plan';

// GET: 2つのバージョンを比較
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const versionAId = searchParams.get('versionA');
  const versionBId = searchParams.get('versionB');

  if (!versionAId || !versionBId) {
    return NextResponse.json(
      { error: 'Both versionA and versionB are required' },
      { status: 400 },
    );
  }

  try {
    // 各バージョンを取得
    const versionAResponse = await fetch(
      `${request.nextUrl.origin}/api/financial-plans?versionId=${versionAId}`,
    );
    const versionBResponse = await fetch(
      `${request.nextUrl.origin}/api/financial-plans?versionId=${versionBId}`,
    );

    if (!versionAResponse.ok || !versionBResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch versions' },
        { status: 404 },
      );
    }

    const versionA = await versionAResponse.json();
    const versionB = await versionBResponse.json();

    // 差分を計算
    const differences: VersionDiff['differences'] = [];

    // カテゴリごとに比較
    versionB.financialData.forEach((categoryB: FinancialItem) => {
      const categoryA = versionA.financialData.find(
        (cat: FinancialItem) => cat.id === categoryB.id,
      );

      if (!categoryA) {
        // カテゴリ全体が新規追加
        categoryB.items.forEach((item) => {
          if (item.amount !== 0) {
            differences.push({
              category: categoryB.category,
              itemName: item.name,
              oldAmount: 0,
              newAmount: item.amount,
              change: item.amount,
              changePercent: 100,
            });
          }
        });
        return;
      }

      // 項目ごとに比較
      categoryB.items.forEach((itemB) => {
        const itemA = categoryA.items.find((i: any) => i.name === itemB.name);
        const oldAmount = itemA ? itemA.amount : 0;
        const newAmount = itemB.amount;
        const change = newAmount - oldAmount;

        if (change !== 0) {
          const changePercent =
            oldAmount === 0 ? 100 : (change / oldAmount) * 100;
          differences.push({
            category: categoryB.category,
            itemName: itemB.name,
            oldAmount,
            newAmount,
            change,
            changePercent,
          });
        }
      });
    });

    // 削除された項目をチェック
    versionA.financialData.forEach((categoryA: FinancialItem) => {
      const categoryB = versionB.financialData.find(
        (cat: FinancialItem) => cat.id === categoryA.id,
      );

      if (!categoryB) {
        // カテゴリ全体が削除
        categoryA.items.forEach((item) => {
          if (item.amount !== 0) {
            differences.push({
              category: categoryA.category,
              itemName: item.name,
              oldAmount: item.amount,
              newAmount: 0,
              change: -item.amount,
              changePercent: -100,
            });
          }
        });
        return;
      }

      // 削除された項目
      categoryA.items.forEach((itemA) => {
        const itemB = categoryB.items.find((i: any) => i.name === itemA.name);
        if (!itemB && itemA.amount !== 0) {
          differences.push({
            category: categoryA.category,
            itemName: itemA.name,
            oldAmount: itemA.amount,
            newAmount: 0,
            change: -itemA.amount,
            changePercent: -100,
          });
        }
      });
    });

    const totalChange = versionB.totalAmount - versionA.totalAmount;

    const result: VersionDiff = {
      versionA,
      versionB,
      differences,
      totalChange,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error comparing versions:', error);
    return NextResponse.json(
      { error: 'Failed to compare versions' },
      { status: 500 },
    );
  }
}
