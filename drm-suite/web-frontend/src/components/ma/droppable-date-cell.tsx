'use client';

import React from 'react';
import { useDrop } from 'react-dnd';
import { Box, Paper } from '@mui/material';

interface DroppableDateCellProps {
  date: Date;
  onDropEvent: (date: Date, event: any) => void;
  children?: React.ReactNode;
  isToday?: boolean;
  isCurrentMonth?: boolean;
  onClick?: () => void;
}

export default function DroppableDateCell({
  date,
  onDropEvent,
  children,
  isToday = false,
  isCurrentMonth = true,
  onClick,
}: DroppableDateCellProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'event',
    drop: (item: any) => onDropEvent(date, item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const isActive = canDrop && isOver;

  return (
    <Paper
      ref={drop}
      onClick={onClick}
      sx={{
        minHeight: 120,
        p: 1,
        backgroundColor: isActive
          ? 'action.hover'
          : isOver
          ? 'action.selected'
          : isToday
          ? 'primary.light'
          : 'background.paper',
        opacity: isCurrentMonth ? 1 : 0.6,
        border: isToday ? '2px solid' : '1px solid',
        borderColor: isToday ? 'primary.main' : 'divider',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: isActive ? 'action.hover' : 'action.hover',
          boxShadow: 1,
        },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box
          sx={{
            fontWeight: isToday ? 'bold' : 'normal',
            color: isToday ? 'primary.main' : 'text.primary',
            mb: 1,
          }}
        >
          {date.getDate()}
        </Box>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '2px',
            },
          }}
        >
          {children}
        </Box>
        {isActive && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'primary.main',
              opacity: 0.1,
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>
    </Paper>
  );
}