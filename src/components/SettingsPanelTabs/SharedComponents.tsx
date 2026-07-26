import React from 'react';
import { SiteSettings } from '../../types';

interface RangeSliderProps {
  label: string;
  name: keyof SiteSettings;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (name: string, value: number) => void;
}

export function RangeSlider({ label, name, value, min, max, step = 1, unit = 'px', onChange }: RangeSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">{label}</label>
        <span className="text-[11px] font-mono text-[#8e8a82]">{value}{unit}</span>
      </div>
      <input 
        type="range" 
        name={name as string}
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(name as string, parseInt(e.target.value, 10))}
        className="w-full h-1.5 bg-[#e5e0d8] rounded-lg appearance-none cursor-pointer accent-[#1a1a1a] mt-3"
      />
    </div>
  );
}

interface SettingInputProps {
  label: string;
  name: keyof SiteSettings;
  value: string | number;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  rows?: number;
}

export function SettingRow({ label, name, value, type = 'text', onChange, placeholder, rows }: SettingInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">{label}</label>
      {type === 'textarea' ? (
        <textarea
          name={name as string}
          value={value}
          onChange={onChange}
          rows={rows || 4}
          placeholder={placeholder}
          className="w-full p-4 bg-[#f8f7f5] border border-[#e5e0d8] rounded-none focus:outline-none focus:border-[#1a1a1a] transition-colors text-sm font-serif"
        />
      ) : type === 'color' ? (
        <div className="flex items-center gap-3">
          <input
            type="color"
            name={name as string}
            value={value}
            onChange={onChange}
            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
          />
          <input
            type="text"
            name={name as string}
            value={value}
            onChange={onChange}
            className="flex-1 p-3 bg-[#f8f7f5] border border-[#e5e0d8] rounded-none focus:outline-none focus:border-[#1a1a1a] transition-colors text-sm font-mono"
          />
        </div>
      ) : (
        <input
          type={type}
          name={name as string}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-4 bg-[#f8f7f5] border border-[#e5e0d8] rounded-none focus:outline-none focus:border-[#1a1a1a] transition-colors text-sm"
        />
      )}
    </div>
  );
}

interface SettingSelectProps {
  label: string;
  name: keyof SiteSettings;
  value: string | number;
  options: { label: string; value: string | number }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function SettingSelect({ label, name, value, options, onChange }: SettingSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold">{label}</label>
      <select
        name={name as string}
        value={value}
        onChange={onChange}
        className="w-full p-4 bg-[#f8f7f5] border border-[#e5e0d8] rounded-none focus:outline-none focus:border-[#1a1a1a] transition-colors text-sm"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface SettingToggleProps {
  label: string;
  name: keyof SiteSettings;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description?: string;
}

export function SettingToggle({ label, name, checked, onChange, description }: SettingToggleProps) {
  return (
    <div className="p-4 bg-[#f8f7f5] border border-[#e5e0d8] rounded-none flex items-center justify-between">
      <div>
        <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">{label}</label>
        {description && <span className="text-[11px] text-[#8e8a82] mt-1 block">{description}</span>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          name={name as string}
          checked={checked} 
          onChange={onChange} 
          className="sr-only peer" 
        />
        <div className="w-11 h-6 bg-[#e5e0d8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
      </label>
    </div>
  );
}
