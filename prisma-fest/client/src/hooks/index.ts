import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

let socket: Socket | null = null;

/**
 * Hook to manage Socket.io connection with auth token.
 */
export function useSocket() {
  const { accessToken } = useAuthStore();

  useEffect(() => {
    socket = io('/', {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [accessToken]);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socket?.on(event, handler);
    return () => { socket?.off(event, handler); };
  }, []);

  return { socket, on };
}

/**
 * Countdown hook — returns days, hours, minutes, seconds to a target date.
 */
export function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/**
 * Debounce hook.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Live count hook — subscribes to Socket.io live visitor count.
 */
export function useLiveCount() {
  const [count, setCount] = useState(0);
  const { on } = useSocket();

  useEffect(() => {
    const cleanup = on('liveCount:update', (data: { count: number }) => {
      setCount(data.count);
    });
    return cleanup;
  }, [on]);

  return count;
}
