import React from 'react';
import { Bold, Italic, Underline, Type } from 'lucide-react';
import { SiteSettings } from '../../types';
import { LETTER_SPACING_OPTIONS } from '../../utils/fontUtils';

interface SettingTextStyleProps {
  label: string;
  name: keyof SiteSettings;
  value: string;
  onChange: (name: string, value: string) => void;
}

export function SettingTextStyle({ label, name, value = '', onChange }: SettingTextStyleProps) {
  const isBold = value.includes('bold');
  const isItalic = value.includes('italic');
  const isUnderline = value.includes('underline');
  const isUppercase = value.includes('uppercase');

  const toggleStyle = (style: string) => {
    let newStyles = (value || '').split(' ').filter(s => s);
    if (newStyles.includes(style)) {
      newStyles = newStyles.filter(s => s !== style);
    } else {
      newStyles.push(style);
    }
    onChange(name as string, newStyles.join(' '));
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest text-[#1a1a1a] font-bold block">{label}</label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => toggleStyle('bold')}
          className={`p-2 border rounded-none transition-colors ${isBold ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-[#f8f7f5] text-[#1a1a1a] border-[#e5e0d8] hover:border-[#1a1a1a]'}`}
          title="Negrito"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => toggleStyle('italic')}
          className={`p-2 border rounded-none transition-colors ${isItalic ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-[#f8f7f5] text-[#1a1a1a] border-[#e5e0d8] hover:border-[#1a1a1a]'}`}
          title="Itálico"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => toggleStyle('underline')}
          className={`p-2 border rounded-none transition-colors ${isUnderline ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-[#f8f7f5] text-[#1a1a1a] border-[#e5e0d8] hover:border-[#1a1a1a]'}`}
          title="Sublinhado"
        >
          <Underline size={16} />
        </button>
        <button
          type="button"
          onClick={() => toggleStyle('uppercase')}
          className={`p-2 border rounded-none transition-colors ${isUppercase ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-[#f8f7f5] text-[#1a1a1a] border-[#e5e0d8] hover:border-[#1a1a1a]'}`}
          title="Maiúsculas"
        >
          <Type size={16} />
        </button>
      </div>
    </div>
  );
}

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

interface SettingLetterSpacingProps {
  label?: string;
  name: keyof SiteSettings;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function SettingLetterSpacing({ label = "ESPAÇAMENTO ENTRE LETRAS", name, value = '0px', onChange }: SettingLetterSpacingProps) {
  return (
    <SettingSelect
      label={label}
      name={name}
      value={value}
      options={LETTER_SPACING_OPTIONS}
      onChange={onChange}
    />
  );
}
