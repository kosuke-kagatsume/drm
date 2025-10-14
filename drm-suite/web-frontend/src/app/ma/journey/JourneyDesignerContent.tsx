'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Paper,
  Grid,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  PlayArrow,
  Pause,
  Settings,
  Delete,
  ContentCopy,
  Email,
  Sms,
  Notifications,
  LocalOffer,
  Timer,
  Person,
  Event,
  TouchApp,
  FilterAlt,
  AccountTree,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  GridOn,
  Help,
} from '@mui/icons-material';

// ノードタイプの定義
type NodeType = 'trigger' | 'action' | 'condition' | 'wait' | 'end';

interface JourneyNode {
  id: string;
  type: NodeType;
  name: string;
  config: any;
  position: { x: number; y: number };
  connections: string[];
}

interface JourneyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: JourneyNode[];
}

export default function JourneyDesigner() {
  const router = useRouter();
  const [selectedNode, setSelectedNode] = useState<JourneyNode | null>(null);
  const [nodes, setNodes] = useState<JourneyNode[]>([
    {
      id: 'start',
      type: 'trigger',
      name: '見積依頼フォーム送信',
      config: { triggerType: 'form_submit' },
      position: { x: 100, y: 200 },
      connections: ['node1'],
    },
    {
      id: 'node1',
      type: 'wait',
      name: '1時間待機',
      config: { duration: '1h' },
      position: { x: 300, y: 200 },
      connections: ['node2'],
    },
    {
      id: 'node2',
      type: 'action',
      name: 'サンキューメール送信',
      config: { actionType: 'email', template: 'thank_you' },
      position: { x: 500, y: 200 },
      connections: ['node3'],
    },
    {
      id: 'node3',
      type: 'condition',
      name: 'メール開封確認',
      config: { condition: 'email_opened', timeframe: '24h' },
      position: { x: 700, y: 200 },
      connections: ['node4', 'node5'],
    },
    {
      id: 'node4',
      type: 'action',
      name: 'フォローアップメール',
      config: { actionType: 'email', template: 'follow_up' },
      position: { x: 900, y: 100 },
      connections: ['end'],
    },
    {
      id: 'node5',
      type: 'action',
      name: 'リマインダーメール',
      config: { actionType: 'email', template: 'reminder' },
      position: { x: 900, y: 300 },
      connections: ['end'],
    },
    {
      id: 'end',
      type: 'end',
      name: 'ジャーニー終了',
      config: {},
      position: { x: 1100, y: 200 },
      connections: [],
    },
  ]);
  const [draggedNode, setDraggedNode] = useState<NodeType | null>(null);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);

  // ノードコンポーネント
  const NodeComponent = ({ node }: { node: JourneyNode }) => {
    const getNodeIcon = () => {
      switch (node.type) {
        case 'trigger':
          return <TouchApp />;
        case 'action':
          return <Email />;
        case 'condition':
          return <FilterAlt />;
        case 'wait':
          return <Timer />;
        case 'end':
          return <AccountTree />;
        default:
          return <Settings />;
      }
    };

    const getNodeColor = () => {
      switch (node.type) {
        case 'trigger':
          return '#667eea';
        case 'action':
          return '#48bb78';
        case 'condition':
          return '#f6ad55';
        case 'wait':
          return '#68d391';
        case 'end':
          return '#fc8181';
        default:
          return '#718096';
      }
    };

    return (
      <Paper
        elevation={selectedNode?.id === node.id ? 8 : 3}
        sx={{
          position: 'absolute',
          left: node.position.x,
          top: node.position.y,
          width: 160,
          p: 1.5,
          bgcolor: 'white',
          border: 2,
          borderColor:
            selectedNode?.id === node.id ? getNodeColor() : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: 4,
          },
        }}
        onClick={() => setSelectedNode(node)}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: getNodeColor(),
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getNodeIcon()}
          </Box>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary">
              {node.type}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {node.name}
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  // 接続線コンポーネント
  const ConnectionLine = ({
    from,
    to,
  }: {
    from: JourneyNode;
    to: JourneyNode;
  }) => {
    const x1 = from.position.x + 160;
    const y1 = from.position.y + 30;
    const x2 = to.position.x;
    const y2 = to.position.y + 30;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#667eea" />
          </marker>
        </defs>
        <path
          d={`M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`}
          stroke="#667eea"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
      </svg>
    );
  };

  // テンプレート
  const templates: JourneyTemplate[] = [
    {
      id: 'estimate_follow',
      name: '📋 見積フォローアップ',
      description: '見積提出後の自動追客で成約率30%UP',
      category: '営業強化',
      nodes: [
        {
          id: 't1',
          type: 'trigger',
          name: '見積閲覧',
          config: { triggerType: 'estimate_viewed' },
          position: { x: 100, y: 200 },
          connections: ['w1'],
        },
        {
          id: 'w1',
          type: 'wait',
          name: '3日待機',
          config: { duration: '3d' },
          position: { x: 250, y: 200 },
          connections: ['c1'],
        },
        {
          id: 'c1',
          type: 'condition',
          name: '未返答確認',
          config: { conditionType: 'estimate_status', estimateStatus: 'sent' },
          position: { x: 400, y: 200 },
          connections: ['a1'],
        },
        {
          id: 'a1',
          type: 'action',
          name: 'リマインドメール',
          config: { actionType: 'email', template: 'estimate_follow' },
          position: { x: 550, y: 200 },
          connections: ['w2'],
        },
        {
          id: 'w2',
          type: 'wait',
          name: '7日待機',
          config: { duration: '7d' },
          position: { x: 700, y: 200 },
          connections: ['a2'],
        },
        {
          id: 'a2',
          type: 'action',
          name: '営業タスク作成',
          config: { actionType: 'task', taskTitle: '電話フォロー' },
          position: { x: 850, y: 200 },
          connections: [],
        },
      ],
    },
    {
      id: 'construction_journey',
      name: '🏗️ 工事完了フォロー',
      description: '工事完了後の満足度向上とリピート獲得',
      category: 'カスタマーサクセス',
      nodes: [
        {
          id: 't1',
          type: 'trigger',
          name: '工事完了',
          config: { triggerType: 'contract_signed' },
          position: { x: 100, y: 200 },
          connections: ['a1'],
        },
        {
          id: 'a1',
          type: 'action',
          name: '完了報告メール',
          config: { actionType: 'email', template: 'completion_notice' },
          position: { x: 250, y: 200 },
          connections: ['w1'],
        },
        {
          id: 'w1',
          type: 'wait',
          name: '3日待機',
          config: { duration: '3d' },
          position: { x: 400, y: 200 },
          connections: ['a2'],
        },
        {
          id: 'a2',
          type: 'action',
          name: 'アンケート送信',
          config: { actionType: 'email', template: 'satisfaction_survey' },
          position: { x: 550, y: 200 },
          connections: ['c1'],
        },
        {
          id: 'c1',
          type: 'condition',
          name: '満足度確認',
          config: { conditionType: 'score_above', scoreThreshold: 80 },
          position: { x: 700, y: 200 },
          connections: ['a3'],
        },
        {
          id: 'a3',
          type: 'action',
          name: 'レビュー依頼',
          config: { actionType: 'email', template: 'review_request' },
          position: { x: 850, y: 200 },
          connections: [],
        },
      ],
    },
    {
      id: 'nurturing_renovation',
      name: '🏠 リフォーム需要育成',
      description: '潜在顧客を3ヶ月でホットリードに育成',
      category: 'リードナーチャリング',
      nodes: [
        {
          id: 't1',
          type: 'trigger',
          name: '資料請求',
          config: { triggerType: 'download' },
          position: { x: 100, y: 200 },
          connections: ['a1'],
        },
        {
          id: 'a1',
          type: 'action',
          name: 'お礼メール',
          config: { actionType: 'email', template: 'thank_you' },
          position: { x: 250, y: 200 },
          connections: ['a2'],
        },
        {
          id: 'a2',
          type: 'action',
          name: 'タグ付与',
          config: { actionType: 'tag_add', tagName: '育成中' },
          position: { x: 400, y: 200 },
          connections: ['w1'],
        },
        {
          id: 'w1',
          type: 'wait',
          name: '1週間待機',
          config: { duration: '1w' },
          position: { x: 550, y: 200 },
          connections: ['a3'],
        },
        {
          id: 'a3',
          type: 'action',
          name: '事例紹介',
          config: { actionType: 'email', template: 'case_study' },
          position: { x: 700, y: 200 },
          connections: ['c1'],
        },
        {
          id: 'c1',
          type: 'condition',
          name: 'エンゲージ確認',
          config: { conditionType: 'email_opened' },
          position: { x: 850, y: 200 },
          connections: ['a4'],
        },
        {
          id: 'a4',
          type: 'action',
          name: 'スコア加算',
          config: { actionType: 'score_add', scoreValue: 20 },
          position: { x: 1000, y: 200 },
          connections: [],
        },
      ],
    },
    {
      id: 'seasonal_campaign',
      name: '🌸 季節商戦キャンペーン',
      description: '外壁塗装の繁忙期に向けた自動集客',
      category: '季節マーケティング',
      nodes: [
        {
          id: 't1',
          type: 'trigger',
          name: '春シーズン開始',
          config: { triggerType: 'schedule', date: '03-01' },
          position: { x: 100, y: 200 },
          connections: ['a1'],
        },
        {
          id: 'a1',
          type: 'action',
          name: 'キャンペーン告知',
          config: { actionType: 'email', template: 'spring_campaign' },
          position: { x: 250, y: 200 },
          connections: ['c1'],
        },
        {
          id: 'c1',
          type: 'condition',
          name: '地域確認',
          config: { conditionType: 'area_location' },
          position: { x: 400, y: 200 },
          connections: ['a2', 'a3'],
        },
        {
          id: 'a2',
          type: 'action',
          name: 'LINE配信',
          config: { actionType: 'line', template: 'local_offer' },
          position: { x: 550, y: 150 },
          connections: [],
        },
        {
          id: 'a3',
          type: 'action',
          name: '限定クーポン',
          config: { actionType: 'email', template: 'special_coupon' },
          position: { x: 550, y: 250 },
          connections: [],
        },
      ],
    },
    {
      id: 'dormant_reactivation',
      name: '😴 休眠顧客掘り起こし',
      description: '1年以上取引のない顧客を再活性化',
      category: 'リアクティベーション',
      nodes: [
        {
          id: 't1',
          type: 'trigger',
          name: '休眠期間1年',
          config: { triggerType: 'tag_added', targetTag: '休眠顧客' },
          position: { x: 100, y: 200 },
          connections: ['a1'],
        },
        {
          id: 'a1',
          type: 'action',
          name: '再開の挨拶',
          config: { actionType: 'email', template: 'we_miss_you' },
          position: { x: 250, y: 200 },
          connections: ['a2'],
        },
        {
          id: 'a2',
          type: 'action',
          name: '特別オファー',
          config: { actionType: 'email', template: 'comeback_offer' },
          position: { x: 400, y: 200 },
          connections: ['c1'],
        },
        {
          id: 'c1',
          type: 'condition',
          name: '反応確認',
          config: { conditionType: 'email_opened' },
          position: { x: 550, y: 200 },
          connections: ['a3'],
        },
        {
          id: 'a3',
          type: 'action',
          name: 'VIPタグ付与',
          config: { actionType: 'tag_add', tagName: 'リアクティブ候補' },
          position: { x: 700, y: 200 },
          connections: [],
        },
      ],
    },
    {
      id: 'warranty_maintenance',
      name: '🔧 定期メンテナンス',
      description: '保証期間に基づく定期点検の自動案内',
      category: 'アフターサービス',
      nodes: [
        {
          id: 't1',
          type: 'trigger',
          name: '点検時期',
          config: { triggerType: 'recurring', interval: '6m' },
          position: { x: 100, y: 200 },
          connections: ['a1'],
        },
        {
          id: 'a1',
          type: 'action',
          name: '点検案内',
          config: { actionType: 'email', template: 'maintenance_notice' },
          position: { x: 250, y: 200 },
          connections: ['a2'],
        },
        {
          id: 'a2',
          type: 'action',
          name: 'SMS送信',
          config: { actionType: 'sms', template: 'inspection_reminder' },
          position: { x: 400, y: 200 },
          connections: ['a3'],
        },
        {
          id: 'a3',
          type: 'action',
          name: '予約リンク',
          config: { actionType: 'schedule_visit' },
          position: { x: 550, y: 200 },
          connections: ['c1'],
        },
        {
          id: 'c1',
          type: 'condition',
          name: '予約確認',
          config: {
            conditionType: 'field_equals',
            field: 'appointment_status',
            value: 'booked',
          },
          position: { x: 700, y: 200 },
          connections: ['a4'],
        },
        {
          id: 'a4',
          type: 'action',
          name: '確認通知',
          config: { actionType: 'notification', message: '点検予約完了' },
          position: { x: 850, y: 200 },
          connections: [],
        },
      ],
    },
  ];

  const getNodeColor = (type: NodeType): string => {
    switch (type) {
      case 'trigger':
        return '#4285f4';
      case 'action':
        return '#48bb78';
      case 'condition':
        return '#f56565';
      case 'wait':
        return '#ed8936';
      case 'end':
        return '#718096';
      default:
        return '#4285f4';
    }
  };

  const handleDragStart = (nodeType: NodeType) => {
    setDraggedNode(nodeType);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedNode) {
      const newNode: JourneyNode = {
        id: `node_${Date.now()}`,
        type: draggedNode,
        name: `新規${draggedNode}`,
        config: {},
        position: {
          x: e.clientX - 250,
          y: e.clientY - 150,
        },
        connections: [],
      };
      setNodes([...nodes, newNode]);
      setDraggedNode(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: 1,
          borderColor: 'divider',
          px: 3,
          py: 2,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => router.push('/ma')}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                カスタマージャーニー設計
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ドラッグ&ドロップでジャーニーを構築
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <IconButton onClick={() => setZoom(Math.max(50, zoom - 10))}>
              <ZoomOut />
            </IconButton>
            <Typography sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
              {zoom}%
            </Typography>
            <IconButton onClick={() => setZoom(Math.min(150, zoom + 10))}>
              <ZoomIn />
            </IconButton>
            <IconButton
              onClick={() => setShowGrid(!showGrid)}
              color={showGrid ? 'primary' : 'default'}
            >
              <GridOn />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Button startIcon={<Undo />}>元に戻す</Button>
            <Button startIcon={<Redo />}>やり直す</Button>
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={() => setShowTemplateDialog(true)}
            >
              テンプレート
            </Button>
            <Button
              variant="outlined"
              startIcon={<Email />}
              onClick={() => router.push('/ma/email')}
            >
              メールテンプレート
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              sx={{ bgcolor: '#667eea' }}
            >
              保存
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              color="success"
            >
              実行
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar - ノードパレット */}
        <Box
          sx={{
            width: 240,
            bgcolor: 'white',
            borderRight: 1,
            borderColor: 'divider',
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            ノードパレット
          </Typography>

          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            トリガー
          </Typography>
          <Paper
            draggable
            onDragStart={() => handleDragStart('trigger')}
            sx={{
              p: 2,
              mb: 1,
              cursor: 'grab',
              bgcolor: '#667eea10',
              border: 1,
              borderColor: '#667eea',
              '&:hover': { bgcolor: '#667eea20' },
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <TouchApp sx={{ color: '#667eea' }} />
              <Typography variant="body2">トリガーイベント</Typography>
            </Box>
          </Paper>

          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: 'block', mb: 1, mt: 2 }}
          >
            アクション
          </Typography>
          <Paper
            draggable
            onDragStart={() => handleDragStart('action')}
            sx={{
              p: 2,
              mb: 1,
              cursor: 'grab',
              bgcolor: '#48bb7810',
              border: 1,
              borderColor: '#48bb78',
              '&:hover': { bgcolor: '#48bb7820' },
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Email sx={{ color: '#48bb78' }} />
              <Typography variant="body2">アクション実行</Typography>
            </Box>
          </Paper>

          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: 'block', mb: 1, mt: 2 }}
          >
            制御
          </Typography>
          <Paper
            draggable
            onDragStart={() => handleDragStart('condition')}
            sx={{
              p: 2,
              mb: 1,
              cursor: 'grab',
              bgcolor: '#f6ad5510',
              border: 1,
              borderColor: '#f6ad55',
              '&:hover': { bgcolor: '#f6ad5520' },
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <FilterAlt sx={{ color: '#f6ad55' }} />
              <Typography variant="body2">条件分岐</Typography>
            </Box>
          </Paper>

          <Paper
            draggable
            onDragStart={() => handleDragStart('wait')}
            sx={{
              p: 2,
              mb: 1,
              cursor: 'grab',
              bgcolor: '#68d39110',
              border: 1,
              borderColor: '#68d391',
              '&:hover': { bgcolor: '#68d39120' },
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Timer sx={{ color: '#68d391' }} />
              <Typography variant="body2">待機</Typography>
            </Box>
          </Paper>
        </Box>

        {/* Main Canvas */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'auto',
            bgcolor: showGrid ? '#fafafa' : '#f5f5f5',
            backgroundImage: showGrid
              ? 'linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)'
              : 'none',
            backgroundSize: '20px 20px',
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Box
            sx={{
              position: 'relative',
              width: '2000px',
              height: '1000px',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
            }}
          >
            {/* 接続線の描画 */}
            {nodes.map((node) =>
              node.connections.map((targetId) => {
                const targetNode = nodes.find((n) => n.id === targetId);
                if (targetNode) {
                  return (
                    <ConnectionLine
                      key={`${node.id}-${targetId}`}
                      from={node}
                      to={targetNode}
                    />
                  );
                }
                return null;
              }),
            )}

            {/* ノードの描画 */}
            {nodes.map((node) => (
              <NodeComponent key={node.id} node={node} />
            ))}
          </Box>
        </Box>

        {/* Right Sidebar - プロパティパネル */}
        <Box
          sx={{
            width: 320,
            bgcolor: 'white',
            borderLeft: 1,
            borderColor: 'divider',
            p: 2,
          }}
        >
          {selectedNode ? (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                ノード設定
              </Typography>
              <TextField
                fullWidth
                label="ノード名"
                value={selectedNode.name}
                sx={{ mb: 2 }}
                onChange={(e) => {
                  const updatedNodes = nodes.map((n) =>
                    n.id === selectedNode.id
                      ? { ...n, name: e.target.value }
                      : n,
                  );
                  setNodes(updatedNodes);
                  setSelectedNode({ ...selectedNode, name: e.target.value });
                }}
              />

              {selectedNode.type === 'trigger' && (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>トリガータイプ</InputLabel>
                    <Select
                      value={selectedNode.config?.triggerType || 'form_submit'}
                      label="トリガータイプ"
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  triggerType: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            triggerType: e.target.value,
                          },
                        });
                      }}
                    >
                      <MenuItem value="category_title" disabled>
                        <Typography variant="caption" color="text.secondary">
                          --- 行動ベース ---
                        </Typography>
                      </MenuItem>
                      <MenuItem value="form_submit">
                        📝 見積依頼フォーム送信
                      </MenuItem>
                      <MenuItem value="contact_form">
                        📧 お問い合わせフォーム送信
                      </MenuItem>
                      <MenuItem value="catalog_download">
                        📥 カタログダウンロード
                      </MenuItem>
                      <MenuItem value="page_view">👀 特定ページ訪問</MenuItem>
                      <MenuItem value="price_check">💰 料金ページ閲覧</MenuItem>
                      <MenuItem value="case_study">📖 施工事例閲覧</MenuItem>

                      <MenuItem value="category_title2" disabled>
                        <Typography variant="caption" color="text.secondary">
                          --- 時間ベース ---
                        </Typography>
                      </MenuItem>
                      <MenuItem value="schedule_date">📅 指定日時到達</MenuItem>
                      <MenuItem value="after_estimate">
                        ⏰ 見積後経過日数
                      </MenuItem>
                      <MenuItem value="after_construction">
                        🏗️ 工事完了後経過
                      </MenuItem>
                      <MenuItem value="seasonal">🌸 季節キャンペーン</MenuItem>

                      <MenuItem value="category_title3" disabled>
                        <Typography variant="caption" color="text.secondary">
                          --- 属性ベース ---
                        </Typography>
                      </MenuItem>
                      <MenuItem value="new_lead">🆕 新規リード登録</MenuItem>
                      <MenuItem value="score_change">
                        📊 リードスコア変更
                      </MenuItem>
                      <MenuItem value="tag_added">🏷️ タグ付与</MenuItem>
                      <MenuItem value="status_change">
                        🔄 ステータス変更
                      </MenuItem>

                      <MenuItem value="category_title4" disabled>
                        <Typography variant="caption" color="text.secondary">
                          --- 建設業特化 ---
                        </Typography>
                      </MenuItem>
                      <MenuItem value="estimate_created">
                        📋 見積書作成
                      </MenuItem>
                      <MenuItem value="contract_signed">✍️ 契約締結</MenuItem>
                      <MenuItem value="construction_start">🚧 着工</MenuItem>
                      <MenuItem value="construction_complete">✅ 竣工</MenuItem>
                      <MenuItem value="inspection_done">🔍 検査完了</MenuItem>
                      <MenuItem value="payment_received">💴 入金確認</MenuItem>
                    </Select>
                  </FormControl>

                  {/* トリガー詳細設定 */}
                  {(selectedNode.config?.triggerType === 'page_view' ||
                    selectedNode.config?.triggerType === 'price_check' ||
                    selectedNode.config?.triggerType === 'case_study') && (
                    <TextField
                      fullWidth
                      label="対象URL"
                      value={selectedNode.config?.targetUrl || ''}
                      placeholder="例: /price, /case/*, /service/exterior"
                      sx={{ mb: 2 }}
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  targetUrl: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            targetUrl: e.target.value,
                          },
                        });
                      }}
                    />
                  )}

                  {(selectedNode.config?.triggerType === 'schedule_date' ||
                    selectedNode.config?.triggerType === 'seasonal') && (
                    <TextField
                      fullWidth
                      type="datetime-local"
                      label="実行日時"
                      value={selectedNode.config?.scheduleDate || ''}
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  scheduleDate: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            scheduleDate: e.target.value,
                          },
                        });
                      }}
                    />
                  )}

                  {(selectedNode.config?.triggerType === 'after_estimate' ||
                    selectedNode.config?.triggerType ===
                      'after_construction') && (
                    <TextField
                      fullWidth
                      type="number"
                      label="経過日数"
                      value={selectedNode.config?.daysAfter || 7}
                      sx={{ mb: 2 }}
                      InputProps={{ endAdornment: '日後' }}
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  daysAfter: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            daysAfter: e.target.value,
                          },
                        });
                      }}
                    />
                  )}

                  {selectedNode.config?.triggerType === 'score_change' && (
                    <TextField
                      fullWidth
                      type="number"
                      label="スコア閾値"
                      value={selectedNode.config?.scoreThreshold || 70}
                      sx={{ mb: 2 }}
                      InputProps={{ endAdornment: '点以上' }}
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  scoreThreshold: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            scoreThreshold: e.target.value,
                          },
                        });
                      }}
                    />
                  )}

                  {selectedNode.config?.triggerType === 'tag_added' && (
                    <TextField
                      fullWidth
                      label="対象タグ"
                      value={selectedNode.config?.targetTag || ''}
                      placeholder="例: ホットリード, 見積依頼, 外壁塗装"
                      sx={{ mb: 2 }}
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  targetTag: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            targetTag: e.target.value,
                          },
                        });
                      }}
                    />
                  )}

                  {/* 高度な設定 */}
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      高度な設定
                    </Typography>
                  </Divider>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>実行頻度</InputLabel>
                    <Select
                      value={selectedNode.config?.frequency || 'once'}
                      label="実行頻度"
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  frequency: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            frequency: e.target.value,
                          },
                        });
                      }}
                    >
                      <MenuItem value="once">1回のみ</MenuItem>
                      <MenuItem value="every_time">毎回実行</MenuItem>
                      <MenuItem value="daily">1日1回まで</MenuItem>
                      <MenuItem value="weekly">週1回まで</MenuItem>
                      <MenuItem value="monthly">月1回まで</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>対象セグメント</InputLabel>
                    <Select
                      value={selectedNode.config?.segment || 'all'}
                      label="対象セグメント"
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  segment: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            segment: e.target.value,
                          },
                        });
                      }}
                    >
                      <MenuItem value="all">全員</MenuItem>
                      <MenuItem value="new_customer">新規顧客</MenuItem>
                      <MenuItem value="existing_customer">既存顧客</MenuItem>
                      <MenuItem value="hot_lead">ホットリード</MenuItem>
                      <MenuItem value="dormant">休眠顧客</MenuItem>
                      <MenuItem value="residential">住宅オーナー</MenuItem>
                      <MenuItem value="commercial">法人・ビルオーナー</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}

              {selectedNode.type === 'action' && (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>アクションタイプ</InputLabel>
                    <Select
                      value={selectedNode.config?.actionType || 'email'}
                      label="アクションタイプ"
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  actionType: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            actionType: e.target.value,
                          },
                        });
                      }}
                    >
                      <MenuItem value="category_communication" disabled>
                        <Typography variant="caption" color="text.secondary">
                          --- コミュニケーション ---
                        </Typography>
                      </MenuItem>
                      <MenuItem value="email">📧 メール送信</MenuItem>
                      <MenuItem value="sms">📱 SMS送信</MenuItem>
                      <MenuItem value="line">💚 LINE送信</MenuItem>
                      <MenuItem value="push">🔔 プッシュ通知</MenuItem>
                      <MenuItem value="dm">✉️ DM郵送</MenuItem>

                      <MenuItem value="category_internal" disabled>
                        <Typography variant="caption" color="text.secondary">
                          --- 社内アクション ---
                        </Typography>
                      </MenuItem>
                      <MenuItem value="notification">🔔 社内通知</MenuItem>
                      <MenuItem value="task">📋 タスク作成</MenuItem>
                      <MenuItem value="assign">👤 担当者割当</MenuItem>
                      <MenuItem value="alert">⚠️ アラート送信</MenuItem>
                      <MenuItem value="slack">💬 Slack通知</MenuItem>

                      <MenuItem value="category_data" disabled>
                        <Typography variant="caption" color="text.secondary">
                          --- データ操作 ---
                        </Typography>
                      </MenuItem>
                      <MenuItem value="tag_add">🏷️ タグ付与</MenuItem>
                      <MenuItem value="tag_remove">❌ タグ削除</MenuItem>
                      <MenuItem value="score_add">➕ スコア加算</MenuItem>
                      <MenuItem value="score_subtract">➖ スコア減算</MenuItem>
                      <MenuItem value="field_update">
                        ✏️ フィールド更新
                      </MenuItem>
                      <MenuItem value="list_add">📁 リスト追加</MenuItem>
                      <MenuItem value="stage_change">🎯 ステージ変更</MenuItem>

                      <MenuItem value="category_construction" disabled>
                        <Typography variant="caption" color="text.secondary">
                          --- 建設業特化 ---
                        </Typography>
                      </MenuItem>
                      <MenuItem value="estimate_send">📋 見積送信</MenuItem>
                      <MenuItem value="contract_generate">
                        📄 契約書生成
                      </MenuItem>
                      <MenuItem value="invoice_send">🧾 請求書送付</MenuItem>
                      <MenuItem value="schedule_visit">
                        🗓️ 現地調査予約
                      </MenuItem>
                      <MenuItem value="progress_notify">
                        🏗️ 工事進捗通知
                      </MenuItem>
                      <MenuItem value="warranty_register">
                        🛡️ 保証書登録
                      </MenuItem>
                      <MenuItem value="maintenance_schedule">
                        🔧 点検スケジュール
                      </MenuItem>

                      <MenuItem value="category_integration" disabled>
                        <Typography variant="caption" color="text.secondary">
                          --- 外部連携 ---
                        </Typography>
                      </MenuItem>
                      <MenuItem value="crm_sync">🔄 CRM同期</MenuItem>
                      <MenuItem value="webhook">🔗 Webhook送信</MenuItem>
                      <MenuItem value="api_call">🌐 API呼出</MenuItem>
                      <MenuItem value="salesforce">☁️ Salesforce連携</MenuItem>
                    </Select>
                  </FormControl>

                  {/* アクションタイプ別の詳細設定 */}
                  {(selectedNode.config?.actionType === 'email' ||
                    selectedNode.config?.actionType === 'sms' ||
                    selectedNode.config?.actionType === 'line') && (
                    <>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>テンプレート</InputLabel>
                        <Select
                          value={selectedNode.config?.template || 'thank_you'}
                          label="テンプレート"
                          onChange={(e) => {
                            const updatedNodes = nodes.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    config: {
                                      ...n.config,
                                      template: e.target.value,
                                    },
                                  }
                                : n,
                            );
                            setNodes(updatedNodes);
                            setSelectedNode({
                              ...selectedNode,
                              config: {
                                ...selectedNode.config,
                                template: e.target.value,
                              },
                            });
                          }}
                        >
                          <MenuItem value="thank_you">
                            お問い合わせ御礼
                          </MenuItem>
                          <MenuItem value="estimate_follow">
                            見積フォローアップ
                          </MenuItem>
                          <MenuItem value="contract_reminder">
                            契約リマインダー
                          </MenuItem>
                          <MenuItem value="progress_update">
                            工事進捗のお知らせ
                          </MenuItem>
                          <MenuItem value="completion_survey">
                            完了後アンケート
                          </MenuItem>
                          <MenuItem value="maintenance_notice">
                            定期点検のご案内
                          </MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>送信タイミング</InputLabel>
                        <Select
                          value={selectedNode.config?.sendTiming || 'immediate'}
                          label="送信タイミング"
                          onChange={(e) => {
                            const updatedNodes = nodes.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    config: {
                                      ...n.config,
                                      sendTiming: e.target.value,
                                    },
                                  }
                                : n,
                            );
                            setNodes(updatedNodes);
                            setSelectedNode({
                              ...selectedNode,
                              config: {
                                ...selectedNode.config,
                                sendTiming: e.target.value,
                              },
                            });
                          }}
                        >
                          <MenuItem value="immediate">即座に送信</MenuItem>
                          <MenuItem value="business_hours">
                            営業時間内に送信
                          </MenuItem>
                          <MenuItem value="morning">翌朝9時に送信</MenuItem>
                          <MenuItem value="evening">当日18時に送信</MenuItem>
                          <MenuItem value="optimal">
                            最適な時間に送信（AI判定）
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {(selectedNode.config?.actionType === 'tag_add' ||
                    selectedNode.config?.actionType === 'tag_remove') && (
                    <TextField
                      fullWidth
                      label="タグ名"
                      value={selectedNode.config?.tagName || ''}
                      placeholder="例: ホットリード, VIP顧客, 要フォロー"
                      sx={{ mb: 2 }}
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  tagName: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            tagName: e.target.value,
                          },
                        });
                      }}
                    />
                  )}

                  {(selectedNode.config?.actionType === 'score_add' ||
                    selectedNode.config?.actionType === 'score_subtract') && (
                    <TextField
                      fullWidth
                      type="number"
                      label="スコア変更値"
                      value={selectedNode.config?.scoreValue || 10}
                      sx={{ mb: 2 }}
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  scoreValue: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            scoreValue: e.target.value,
                          },
                        });
                      }}
                    />
                  )}

                  {selectedNode.config?.actionType === 'task' && (
                    <>
                      <TextField
                        fullWidth
                        label="タスクタイトル"
                        value={selectedNode.config?.taskTitle || ''}
                        placeholder="例: フォローアップ電話"
                        sx={{ mb: 2 }}
                        onChange={(e) => {
                          const updatedNodes = nodes.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  config: {
                                    ...n.config,
                                    taskTitle: e.target.value,
                                  },
                                }
                              : n,
                          );
                          setNodes(updatedNodes);
                          setSelectedNode({
                            ...selectedNode,
                            config: {
                              ...selectedNode.config,
                              taskTitle: e.target.value,
                            },
                          });
                        }}
                      />
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>期限</InputLabel>
                        <Select
                          value={selectedNode.config?.taskDue || '1d'}
                          label="期限"
                          onChange={(e) => {
                            const updatedNodes = nodes.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    config: {
                                      ...n.config,
                                      taskDue: e.target.value,
                                    },
                                  }
                                : n,
                            );
                            setNodes(updatedNodes);
                            setSelectedNode({
                              ...selectedNode,
                              config: {
                                ...selectedNode.config,
                                taskDue: e.target.value,
                              },
                            });
                          }}
                        >
                          <MenuItem value="1h">1時間以内</MenuItem>
                          <MenuItem value="4h">4時間以内</MenuItem>
                          <MenuItem value="1d">1日以内</MenuItem>
                          <MenuItem value="3d">3日以内</MenuItem>
                          <MenuItem value="1w">1週間以内</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {selectedNode.config?.actionType === 'estimate_send' && (
                    <>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>見積タイプ</InputLabel>
                        <Select
                          value={
                            selectedNode.config?.estimateType || 'standard'
                          }
                          label="見積タイプ"
                          onChange={(e) => {
                            const updatedNodes = nodes.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    config: {
                                      ...n.config,
                                      estimateType: e.target.value,
                                    },
                                  }
                                : n,
                            );
                            setNodes(updatedNodes);
                            setSelectedNode({
                              ...selectedNode,
                              config: {
                                ...selectedNode.config,
                                estimateType: e.target.value,
                              },
                            });
                          }}
                        >
                          <MenuItem value="standard">標準見積</MenuItem>
                          <MenuItem value="premium">プレミアムプラン</MenuItem>
                          <MenuItem value="economy">エコノミープラン</MenuItem>
                          <MenuItem value="custom">カスタム見積</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>有効期限</InputLabel>
                        <Select
                          value={selectedNode.config?.estimateValidity || '30d'}
                          label="有効期限"
                          onChange={(e) => {
                            const updatedNodes = nodes.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    config: {
                                      ...n.config,
                                      estimateValidity: e.target.value,
                                    },
                                  }
                                : n,
                            );
                            setNodes(updatedNodes);
                            setSelectedNode({
                              ...selectedNode,
                              config: {
                                ...selectedNode.config,
                                estimateValidity: e.target.value,
                              },
                            });
                          }}
                        >
                          <MenuItem value="7d">7日間</MenuItem>
                          <MenuItem value="14d">14日間</MenuItem>
                          <MenuItem value="30d">30日間</MenuItem>
                          <MenuItem value="60d">60日間</MenuItem>
                          <MenuItem value="90d">90日間</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {/* 高度な設定 */}
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      実行条件
                    </Typography>
                  </Divider>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>実行制限</InputLabel>
                    <Select
                      value={selectedNode.config?.executionLimit || 'unlimited'}
                      label="実行制限"
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  executionLimit: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            executionLimit: e.target.value,
                          },
                        });
                      }}
                    >
                      <MenuItem value="unlimited">制限なし</MenuItem>
                      <MenuItem value="once_per_contact">
                        顧客ごとに1回
                      </MenuItem>
                      <MenuItem value="once_per_day">1日1回まで</MenuItem>
                      <MenuItem value="once_per_week">週1回まで</MenuItem>
                      <MenuItem value="once_per_month">月1回まで</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedNode.config?.skipWeekends || false}
                        onChange={(e) => {
                          const updatedNodes = nodes.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  config: {
                                    ...n.config,
                                    skipWeekends: e.target.checked,
                                  },
                                }
                              : n,
                          );
                          setNodes(updatedNodes);
                          setSelectedNode({
                            ...selectedNode,
                            config: {
                              ...selectedNode.config,
                              skipWeekends: e.target.checked,
                            },
                          });
                        }}
                      />
                    }
                    label="週末はスキップ"
                    sx={{ mb: 1 }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedNode.config?.requireApproval || false}
                        onChange={(e) => {
                          const updatedNodes = nodes.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  config: {
                                    ...n.config,
                                    requireApproval: e.target.checked,
                                  },
                                }
                              : n,
                          );
                          setNodes(updatedNodes);
                          setSelectedNode({
                            ...selectedNode,
                            config: {
                              ...selectedNode.config,
                              requireApproval: e.target.checked,
                            },
                          });
                        }}
                      />
                    }
                    label="実行前に承認が必要"
                    sx={{ mb: 2 }}
                  />
                </>
              )}

              {selectedNode.type === 'condition' && (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>条件タイプ</InputLabel>
                    <Select
                      value={
                        selectedNode.config?.conditionType || 'email_opened'
                      }
                      label="条件タイプ"
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  conditionType: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            conditionType: e.target.value,
                          },
                        });
                      }}
                    >
                      <MenuItem value="category_engagement" disabled>
                        <Typography variant="caption" color="text.secondary">
                          --- エンゲージメント ---
                        </Typography>
                      </MenuItem>
                      <MenuItem value="email_opened">📧 メール開封</MenuItem>
                      <MenuItem value="link_clicked">
                        🔗 リンククリック
                      </MenuItem>
                      <MenuItem value="form_submitted">
                        📝 フォーム送信
                      </MenuItem>
                      <MenuItem value="document_downloaded">
                        📥 資料ダウンロード
                      </MenuItem>
                      <MenuItem value="page_visited">
                        👀 特定ページ訪問
                      </MenuItem>

                      <MenuItem value="category_score" disabled>
                        <Typography variant="caption" color="text.secondary">
                          --- スコアリング ---
                        </Typography>
                      </MenuItem>
                      <MenuItem value="score_above">
                        📊 リードスコア以上
                      </MenuItem>
                      <MenuItem value="score_below">
                        📉 リードスコア以下
                      </MenuItem>
                      <MenuItem value="score_change">🔄 スコア変化</MenuItem>

                      <MenuItem value="category_attribute" disabled>
                        <Typography variant="caption" color="text.secondary">
                          --- 属性条件 ---
                        </Typography>
                      </MenuItem>
                      <MenuItem value="tag_exists">🏷️ タグ保有</MenuItem>
                      <MenuItem value="tag_not_exists">❌ タグ非保有</MenuItem>
                      <MenuItem value="field_equals">
                        ✅ フィールド一致
                      </MenuItem>
                      <MenuItem value="field_contains">
                        🔍 フィールド含む
                      </MenuItem>

                      <MenuItem value="category_construction" disabled>
                        <Typography variant="caption" color="text.secondary">
                          --- 建設業特化 ---
                        </Typography>
                      </MenuItem>
                      <MenuItem value="estimate_status">
                        📋 見積ステータス
                      </MenuItem>
                      <MenuItem value="construction_phase">
                        🏗️ 工事フェーズ
                      </MenuItem>
                      <MenuItem value="budget_range">💰 予算範囲</MenuItem>
                      <MenuItem value="property_type">🏠 物件タイプ</MenuItem>
                      <MenuItem value="area_location">📍 地域エリア</MenuItem>
                      <MenuItem value="season_timing">
                        🌸 季節タイミング
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {/* 条件の詳細設定 */}
                  {(selectedNode.config?.conditionType === 'email_opened' ||
                    selectedNode.config?.conditionType === 'link_clicked') && (
                    <TextField
                      fullWidth
                      label="判定期間"
                      value={selectedNode.config?.timeframe || '24h'}
                      placeholder="例: 24h, 3d, 1w"
                      sx={{ mb: 2 }}
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  timeframe: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            timeframe: e.target.value,
                          },
                        });
                      }}
                    />
                  )}

                  {(selectedNode.config?.conditionType === 'score_above' ||
                    selectedNode.config?.conditionType === 'score_below') && (
                    <TextField
                      fullWidth
                      type="number"
                      label="スコア閾値"
                      value={selectedNode.config?.scoreValue || 70}
                      sx={{ mb: 2 }}
                      InputProps={{ endAdornment: '点' }}
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  scoreValue: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            scoreValue: e.target.value,
                          },
                        });
                      }}
                    />
                  )}

                  {(selectedNode.config?.conditionType === 'tag_exists' ||
                    selectedNode.config?.conditionType ===
                      'tag_not_exists') && (
                    <TextField
                      fullWidth
                      label="対象タグ"
                      value={selectedNode.config?.targetTag || ''}
                      placeholder="例: ホットリード, 外壁塗装興味あり"
                      sx={{ mb: 2 }}
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  targetTag: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            targetTag: e.target.value,
                          },
                        });
                      }}
                    />
                  )}

                  {selectedNode.config?.conditionType === 'estimate_status' && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>見積ステータス</InputLabel>
                      <Select
                        value={selectedNode.config?.estimateStatus || 'sent'}
                        label="見積ステータス"
                        onChange={(e) => {
                          const updatedNodes = nodes.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  config: {
                                    ...n.config,
                                    estimateStatus: e.target.value,
                                  },
                                }
                              : n,
                          );
                          setNodes(updatedNodes);
                          setSelectedNode({
                            ...selectedNode,
                            config: {
                              ...selectedNode.config,
                              estimateStatus: e.target.value,
                            },
                          });
                        }}
                      >
                        <MenuItem value="requested">見積依頼済</MenuItem>
                        <MenuItem value="sent">見積送付済</MenuItem>
                        <MenuItem value="viewed">見積閲覧済</MenuItem>
                        <MenuItem value="negotiating">交渉中</MenuItem>
                        <MenuItem value="accepted">承認済</MenuItem>
                        <MenuItem value="rejected">却下</MenuItem>
                      </Select>
                    </FormControl>
                  )}

                  {selectedNode.config?.conditionType ===
                    'construction_phase' && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>工事フェーズ</InputLabel>
                      <Select
                        value={selectedNode.config?.phase || 'planning'}
                        label="工事フェーズ"
                        onChange={(e) => {
                          const updatedNodes = nodes.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  config: {
                                    ...n.config,
                                    phase: e.target.value,
                                  },
                                }
                              : n,
                          );
                          setNodes(updatedNodes);
                          setSelectedNode({
                            ...selectedNode,
                            config: {
                              ...selectedNode.config,
                              phase: e.target.value,
                            },
                          });
                        }}
                      >
                        <MenuItem value="planning">計画中</MenuItem>
                        <MenuItem value="contracted">契約済</MenuItem>
                        <MenuItem value="preparing">着工準備</MenuItem>
                        <MenuItem value="construction">施工中</MenuItem>
                        <MenuItem value="inspection">検査中</MenuItem>
                        <MenuItem value="completed">竣工</MenuItem>
                        <MenuItem value="maintenance">アフターケア</MenuItem>
                      </Select>
                    </FormControl>
                  )}

                  {selectedNode.config?.conditionType === 'budget_range' && (
                    <>
                      <TextField
                        fullWidth
                        type="number"
                        label="予算下限"
                        value={selectedNode.config?.budgetMin || 100}
                        sx={{ mb: 1 }}
                        InputProps={{ endAdornment: '万円' }}
                        onChange={(e) => {
                          const updatedNodes = nodes.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  config: {
                                    ...n.config,
                                    budgetMin: e.target.value,
                                  },
                                }
                              : n,
                          );
                          setNodes(updatedNodes);
                          setSelectedNode({
                            ...selectedNode,
                            config: {
                              ...selectedNode.config,
                              budgetMin: e.target.value,
                            },
                          });
                        }}
                      />
                      <TextField
                        fullWidth
                        type="number"
                        label="予算上限"
                        value={selectedNode.config?.budgetMax || 500}
                        sx={{ mb: 2 }}
                        InputProps={{ endAdornment: '万円' }}
                        onChange={(e) => {
                          const updatedNodes = nodes.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  config: {
                                    ...n.config,
                                    budgetMax: e.target.value,
                                  },
                                }
                              : n,
                          );
                          setNodes(updatedNodes);
                          setSelectedNode({
                            ...selectedNode,
                            config: {
                              ...selectedNode.config,
                              budgetMax: e.target.value,
                            },
                          });
                        }}
                      />
                    </>
                  )}

                  {selectedNode.config?.conditionType === 'property_type' && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>物件タイプ</InputLabel>
                      <Select
                        value={
                          selectedNode.config?.propertyType || 'residential'
                        }
                        label="物件タイプ"
                        onChange={(e) => {
                          const updatedNodes = nodes.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  config: {
                                    ...n.config,
                                    propertyType: e.target.value,
                                  },
                                }
                              : n,
                          );
                          setNodes(updatedNodes);
                          setSelectedNode({
                            ...selectedNode,
                            config: {
                              ...selectedNode.config,
                              propertyType: e.target.value,
                            },
                          });
                        }}
                      >
                        <MenuItem value="residential">戸建住宅</MenuItem>
                        <MenuItem value="apartment">マンション</MenuItem>
                        <MenuItem value="commercial">店舗・オフィス</MenuItem>
                        <MenuItem value="factory">工場・倉庫</MenuItem>
                        <MenuItem value="public">公共施設</MenuItem>
                      </Select>
                    </FormControl>
                  )}

                  {/* 分岐設定 */}
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      分岐設定
                    </Typography>
                  </Divider>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>TRUE時の処理</InputLabel>
                    <Select
                      value={selectedNode.config?.trueBranch || 'continue'}
                      label="TRUE時の処理"
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  trueBranch: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            trueBranch: e.target.value,
                          },
                        });
                      }}
                    >
                      <MenuItem value="continue">次のノードへ進む</MenuItem>
                      <MenuItem value="skip">スキップ</MenuItem>
                      <MenuItem value="end">ジャーニー終了</MenuItem>
                      <MenuItem value="jump">別ノードへジャンプ</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>FALSE時の処理</InputLabel>
                    <Select
                      value={selectedNode.config?.falseBranch || 'alternative'}
                      label="FALSE時の処理"
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  falseBranch: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            falseBranch: e.target.value,
                          },
                        });
                      }}
                    >
                      <MenuItem value="alternative">代替パスへ</MenuItem>
                      <MenuItem value="wait">待機して再評価</MenuItem>
                      <MenuItem value="end">ジャーニー終了</MenuItem>
                      <MenuItem value="tag">タグ付与して続行</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>評価タイミング</InputLabel>
                    <Select
                      value={
                        selectedNode.config?.evaluationTiming || 'immediate'
                      }
                      label="評価タイミング"
                      onChange={(e) => {
                        const updatedNodes = nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                config: {
                                  ...n.config,
                                  evaluationTiming: e.target.value,
                                },
                              }
                            : n,
                        );
                        setNodes(updatedNodes);
                        setSelectedNode({
                          ...selectedNode,
                          config: {
                            ...selectedNode.config,
                            evaluationTiming: e.target.value,
                          },
                        });
                      }}
                    >
                      <MenuItem value="immediate">即座に評価</MenuItem>
                      <MenuItem value="wait_1h">1時間待って評価</MenuItem>
                      <MenuItem value="wait_24h">24時間待って評価</MenuItem>
                      <MenuItem value="wait_3d">3日待って評価</MenuItem>
                      <MenuItem value="wait_7d">1週間待って評価</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}

              {selectedNode.type === 'wait' && (
                <TextField
                  fullWidth
                  label="待機時間"
                  value="1h"
                  sx={{ mb: 2 }}
                />
              )}

              <Divider sx={{ my: 2 }} />
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => {
                  setNodes(nodes.filter((n) => n.id !== selectedNode.id));
                  setSelectedNode(null);
                }}
              >
                ノードを削除
              </Button>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                ノードを選択して設定を編集
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* テンプレートダイアログ */}
      <Dialog
        open={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            🎯 ジャーニーテンプレート
          </Typography>
          <Typography variant="body2" color="text.secondary">
            建設業界で実績のあるテンプレートから選択してください
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} key={template.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                      borderColor: 'primary.main',
                    },
                    border: '2px solid transparent',
                  }}
                  onClick={() => {
                    // テンプレートのノードをキャンバスに読み込む
                    setNodes(template.nodes);
                    setJourneyName(template.name.replace(/^[^\s]+\s/, '')); // 絵文字を除去
                    setShowTemplateDialog(false);
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, flex: 1 }}
                      >
                        {template.name}
                      </Typography>
                      <Chip
                        label={template.category}
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {template.description}
                    </Typography>

                    {/* ジャーニーフロー表示 */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        p: 1,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        overflowX: 'auto',
                      }}
                    >
                      {template.nodes.slice(0, 5).map((node, index) => (
                        <React.Fragment key={node.id}>
                          {index > 0 && (
                            <Typography
                              variant="caption"
                              sx={{ mx: 0.5, color: 'text.secondary' }}
                            >
                              →
                            </Typography>
                          )}
                          <Chip
                            label={node.name}
                            size="small"
                            variant="outlined"
                            sx={{
                              bgcolor: 'white',
                              borderColor: getNodeColor(node.type),
                              color: getNodeColor(node.type),
                              fontSize: '0.7rem',
                            }}
                          />
                        </React.Fragment>
                      ))}
                      {template.nodes.length > 5 && (
                        <Typography
                          variant="caption"
                          sx={{ ml: 1, color: 'text.secondary' }}
                        >
                          +{template.nodes.length - 5}
                        </Typography>
                      )}
                    </Box>

                    {/* ステップ数と期待効果 */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          ステップ数:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ ml: 0.5, fontWeight: 600 }}
                        >
                          {template.nodes.length}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          実装期間:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ ml: 0.5, fontWeight: 600 }}
                        >
                          即日
                        </Typography>
                      </Box>
                    </Box>

                    {/* 選択ボタン */}
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ mt: 2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setNodes(template.nodes);
                        setJourneyName(template.name.replace(/^[^\s]+\s/, ''));
                        setShowTemplateDialog(false);
                      }}
                    >
                      このテンプレートを使用
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplateDialog(false)}>
            キャンセル
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
