'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Typography,
  Chip,
  Divider,
  Stack,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Close,
  Event,
  AccessTime,
  Group,
  Label,
  Delete,
  Save,
  LocationOn,
  Description,
  Notifications,
  CalendarMonth,
} from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ja from 'date-fns/locale/ja';

interface EventEditModalProps {
  open: boolean;
  event: any | null;
  onClose: () => void;
  onSave: (event: any) => void;
  onDelete?: (eventId: string) => void;
}

export default function EventEditModal({
  open,
  event,
  onClose,
  onSave,
  onDelete,
}: EventEditModalProps) {
  const [editedEvent, setEditedEvent] = useState<any>({
    title: '',
    type: 'campaign',
    date: new Date(),
    time: '',
    participants: 0,
    location: '',
    description: '',
    reminder: '1day',
  });
  const [errors, setErrors] = useState<any>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (event) {
      setEditedEvent({
        ...event,
        location: event.location || '',
        description: event.description || '',
        reminder: event.reminder || '1day',
      });
    } else {
      // 新規作成の場合
      setEditedEvent({
        title: '',
        type: 'campaign',
        date: new Date(),
        time: '',
        participants: 0,
        location: '',
        description: '',
        reminder: '1day',
      });
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [event, open]);

  const validateForm = () => {
    const newErrors: any = {};
    if (!editedEvent.title) {
      newErrors.title = 'タイトルは必須です';
    }
    if (!editedEvent.date) {
      newErrors.date = '日付は必須です';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(editedEvent);
    }
  };

  const handleDelete = () => {
    if (event && event.id && onDelete) {
      onDelete(event.id);
      setShowDeleteConfirm(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exhibition':
        return '#f093fb';
      case 'campaign':
        return '#667eea';
      case 'follow':
        return '#4facfe';
      default:
        return '#9e9e9e';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'exhibition':
        return '展示場イベント';
      case 'campaign':
        return 'キャンペーン';
      case 'follow':
        return 'フォローアップ';
      default:
        return 'その他';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${getEventTypeColor(editedEvent.type)} 0%, ${getEventTypeColor(editedEvent.type)}dd 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Event />
          <Typography variant="h6">
            {event ? 'イベント編集' : '新規イベント作成'}
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* タイトル */}
          <TextField
            fullWidth
            label="イベントタイトル"
            value={editedEvent.title}
            onChange={(e) =>
              setEditedEvent({ ...editedEvent, title: e.target.value })
            }
            error={!!errors.title}
            helperText={errors.title}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Label />
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />

          {/* イベントタイプ */}
          <FormControl fullWidth>
            <InputLabel>イベントタイプ</InputLabel>
            <Select
              value={editedEvent.type}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, type: e.target.value })
              }
              label="イベントタイプ"
              startAdornment={
                <InputAdornment position="start">
                  <CalendarMonth />
                </InputAdornment>
              }
            >
              <MenuItem value="exhibition">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: '#f093fb',
                    }}
                  />
                  展示場イベント
                </Box>
              </MenuItem>
              <MenuItem value="campaign">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: '#667eea',
                    }}
                  />
                  キャンペーン
                </Box>
              </MenuItem>
              <MenuItem value="follow">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: '#4facfe',
                    }}
                  />
                  フォローアップ
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* 日時 */}
          <Box display="flex" gap={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
              <DateTimePicker
                label="日時"
                value={editedEvent.date}
                onChange={(newValue) =>
                  setEditedEvent({ ...editedEvent, date: newValue })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* 参加者数（展示場イベントの場合） */}
          {editedEvent.type === 'exhibition' && (
            <TextField
              fullWidth
              label="参加予定者数"
              type="number"
              value={editedEvent.participants || 0}
              onChange={(e) =>
                setEditedEvent({
                  ...editedEvent,
                  participants: parseInt(e.target.value) || 0,
                })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Group />
                  </InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">名</InputAdornment>,
              }}
            />
          )}

          {/* 場所 */}
          <TextField
            fullWidth
            label="場所"
            value={editedEvent.location}
            onChange={(e) =>
              setEditedEvent({ ...editedEvent, location: e.target.value })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn />
                </InputAdornment>
              ),
            }}
            placeholder="例：東京展示場、オンライン"
          />

          {/* 説明 */}
          <TextField
            fullWidth
            label="説明・メモ"
            multiline
            rows={3}
            value={editedEvent.description}
            onChange={(e) =>
              setEditedEvent({ ...editedEvent, description: e.target.value })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Description />
                </InputAdornment>
              ),
            }}
            placeholder="イベントの詳細や注意事項を入力"
          />

          {/* リマインダー */}
          <FormControl fullWidth>
            <InputLabel>リマインダー</InputLabel>
            <Select
              value={editedEvent.reminder}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, reminder: e.target.value })
              }
              label="リマインダー"
              startAdornment={
                <InputAdornment position="start">
                  <Notifications />
                </InputAdornment>
              }
            >
              <MenuItem value="none">なし</MenuItem>
              <MenuItem value="15min">15分前</MenuItem>
              <MenuItem value="30min">30分前</MenuItem>
              <MenuItem value="1hour">1時間前</MenuItem>
              <MenuItem value="1day">1日前</MenuItem>
              <MenuItem value="1week">1週間前</MenuItem>
            </Select>
          </FormControl>

          {/* 削除確認 */}
          {showDeleteConfirm && (
            <Alert
              severity="warning"
              action={
                <Box>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    キャンセル
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={handleDelete}
                    sx={{ ml: 1 }}
                  >
                    削除する
                  </Button>
                </Box>
              }
            >
              このイベントを削除してもよろしいですか？
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5 }}>
        {event && onDelete && !showDeleteConfirm && (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            color="error"
            startIcon={<Delete />}
            sx={{ mr: 'auto' }}
          >
            削除
          </Button>
        )}
        <Button onClick={onClose} color="inherit">
          キャンセル
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Save />}
          sx={{
            background: `linear-gradient(135deg, ${getEventTypeColor(
              editedEvent.type
            )} 0%, ${getEventTypeColor(editedEvent.type)}dd 100%)`,
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          }}
        >
          {event ? '保存' : '作成'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}