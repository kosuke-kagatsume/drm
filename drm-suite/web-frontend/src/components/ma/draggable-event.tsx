'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { Typography, Box } from '@mui/material';

interface DraggableEventProps {
  event: {
    id: string;
    title: string;
    type: string;
    time?: string;
    participants?: number;
    date: Date;
  };
  onClick: (event: any) => void;
}

export default function DraggableEvent({ event, onClick }: DraggableEventProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'event',
    item: event,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getEventColor = (type: string) => {
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

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'exhibition':
        return 'exhibi...';
      case 'campaign':
        return 'camp...';
      case 'follow':
        return 'follow';
      default:
        return type;
    }
  };

  return (
    <Box
      ref={drag}
      onClick={() => onClick(event)}
      sx={{
        p: 0.5,
        mb: 0.25,
        backgroundColor: getEventColor(event.type),
        color: 'white',
        borderRadius: 0.5,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'pointer',
        fontSize: '0.7rem',
        lineHeight: 1.2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '&:hover': {
          opacity: 0.9,
        },
        transition: 'opacity 0.2s ease',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.7rem',
          fontWeight: 500,
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {event.title}
      </Typography>
      {event.time && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.6rem',
            opacity: 0.9,
            display: 'inline-block',
          }}
        >
          {event.time}
          {event.participants && event.participants > 0 && ` • ${event.participants}名`}
        </Typography>
      )}
    </Box>
  );
}