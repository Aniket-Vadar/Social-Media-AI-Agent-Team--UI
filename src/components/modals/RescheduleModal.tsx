'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CalendarClock,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const RescheduleModal: React.FC = () => {
  const { reschedulingPost, setReschedulingPost, reschedulePost, showSuccess } = useApp();

  // If no post selected, don't render
  if (!reschedulingPost) return null;

  // Initial date & time state
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() + 1); // default to tomorrow

  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [selectedSlotLabel, setSelectedSlotLabel] = useState<string>('Morning Peak (10:00 AM)');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isPastDay = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const quickPresets = [
    { label: 'Tomorrow', daysAhead: 1 },
    { label: 'In 2 Days', daysAhead: 2 },
    { label: 'This Weekend', daysAhead: ((6 - new Date().getDay() + 7) % 7) || 7 },
    { label: 'Next Week', daysAhead: 7 },
  ];

  const quickTimeSlots = [
    { time: '10:00', label: '10:00 AM', tag: 'Morning Peak' },
    { time: '14:00', label: '02:00 PM', tag: 'Afternoon Rush' },
    { time: '19:00', label: '07:00 PM', tag: 'Evening Prime' },
    { time: '21:30', label: '09:30 PM', tag: 'Night Scroll' },
  ];

  const handleSelectPreset = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setSelectedDate(d);
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const handleConfirmReschedule = () => {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const targetDate = new Date(selectedDate);
    targetDate.setHours(hours || 10, minutes || 0, 0, 0);

    const isoString = targetDate.toISOString();

    const formattedDisplay = targetDate.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    reschedulePost(reschedulingPost.id, isoString, formattedDisplay);
    setReschedulingPost(null);
    showSuccess(`Post rescheduled for ${formattedDisplay}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Reschedule Post</h3>
              <p className="text-xs text-gray-400">Choose a new publication slot and peak audience window</p>
            </div>
          </div>
          <button
            onClick={() => setReschedulingPost(null)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Post Thumbnail Strip */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
            {reschedulingPost.mediaUrl && (
              <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0 bg-gray-900 border border-gray-200">
                <Image
                  src={reschedulingPost.mediaUrl}
                  alt={reschedulingPost.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-gray-800 truncate">{reschedulingPost.title}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Current: <span className="font-semibold text-gray-600">{reschedulingPost.scheduledDisplay || 'Not scheduled'}</span>
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700">Quick Days</span>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset.daysAhead)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-brand-500 hover:bg-brand-50/50 text-xs font-medium text-gray-700 hover:text-brand-600 transition-all shadow-2xs"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Month Calendar Grid */}
          <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-2xs space-y-3">
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 font-mono">
                {monthNames[month]} {year}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {daysOfWeek.map(d => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const d = new Date(year, month, dayNum);
                const isSelected = isSameDay(d, selectedDate);
                const past = isPastDay(d);

                return (
                  <button
                    key={dayNum}
                    type="button"
                    disabled={past}
                    onClick={() => setSelectedDate(d)}
                    className={`h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-brand-500 text-white shadow-sm font-bold scale-105'
                        : past
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-brand-600'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker & Peak Slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>Select Time & Peak Slot</span>
              </span>
              <input
                type="time"
                value={selectedTime}
                onChange={e => {
                  setSelectedTime(e.target.value);
                  setSelectedSlotLabel(`Custom (${e.target.value})`);
                }}
                className="px-2.5 py-1 rounded-xl border border-gray-300 text-xs font-mono font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {quickTimeSlots.map(slot => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => {
                    setSelectedTime(slot.time);
                    setSelectedSlotLabel(`${slot.tag} (${slot.label})`);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedTime === slot.time
                      ? 'border-brand-500 bg-brand-50/50 text-brand-900 shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{slot.label}</div>
                    <div className="text-[10px] text-gray-400">{slot.tag}</div>
                  </div>
                  {selectedTime === slot.time && <Check className="w-4 h-4 text-brand-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Summary Pill */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">New Schedule Target</span>
              <div className="text-xs font-bold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {selectedTime}
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-white px-2.5 py-1 rounded-full border border-indigo-100 shadow-2xs">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>{selectedSlotLabel}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setReschedulingPost(null)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReschedule}
            className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Confirm & Reschedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};

