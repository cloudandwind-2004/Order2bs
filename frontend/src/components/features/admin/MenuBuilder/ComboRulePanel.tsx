import { useState, useEffect } from 'react';
import { Settings2, Zap, ToggleLeft, ToggleRight, Save, Info, X } from 'lucide-react';
import { menuApi } from '@/api';
import type { ComboRule } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  sessionId: string;
  sessionName: string;
  initialRule?: ComboRule | null;
  onClose?: () => void;
}

export default function ComboRulePanel({ sessionId, sessionName, initialRule, onClose }: Props) {
  const [rule, setRule] = useState<ComboRule>({
    session_id: sessionId,
    name: 'Combo 3 món',
    required_items: 3,
    combo_price: 45000,
    is_active: false,
    description: 'Chọn đủ 3 món để hưởng giá combo đặc biệt!',
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialRule) {
      setRule(initialRule);
    }
  }, [initialRule]);

  const update = (patch: Partial<ComboRule>) => {
    setRule(prev => ({ ...prev, ...patch }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await menuApi.saveComboRule(sessionId, rule);
      setIsDirty(false);
      toast.success('Đã lưu cài đặt combo lên hệ thống! 🎉');
    } catch {
      toast.error('Lỗi khi lưu cài đặt combo');
    }
  };

  const handleReset = () => {
    setRule({
      session_id: sessionId,
      name: 'Combo 3 món',
      required_items: 3,
      combo_price: 45000,
      is_active: false,
      description: 'Chọn đủ 3 món để hưởng giá combo đặc biệt!',
    });
    setIsDirty(true);
  };

  const pricePerItem = rule.required_items > 0
    ? Math.round(rule.combo_price / rule.required_items)
    : 0;

  return (
    <div style={{
      background: 'var(--c-surface)',
      borderRadius: 'var(--r-2xl)',
      border: '2px solid var(--c-border-light)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--r-md)',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={20} color="#f0c040" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              CẤU HÌNH COMBO
            </div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
              Menu gọi chọn món động
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Active Toggle */}
          <button
            type="button"
            onClick={() => update({ is_active: !rule.is_active })}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: rule.is_active ? 'rgba(91,200,107,0.2)' : 'rgba(255,255,255,0.1)',
              border: `1px solid ${rule.is_active ? 'rgba(91,200,107,0.5)' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: 'var(--r-full)',
              padding: '6px 16px',
              cursor: 'pointer',
              color: rule.is_active ? '#7fff7f' : 'rgba(255,255,255,0.7)',
              fontSize: '0.8rem', fontWeight: 700,
              transition: 'all 0.3s ease',
            }}
          >
            {rule.is_active
              ? <><ToggleRight size={18} color="#7fff7f" /> BẬT</>
              : <><ToggleLeft size={18} /> TẮT</>
            }
          </button>
          {onClose && (
            <button type="button" onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--r-md)', padding: 8, cursor: 'pointer', color: '#fff' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Status Banner */}
        {rule.is_active ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(91,200,107,0.1), rgba(91,200,107,0.05))',
            border: '1px solid rgba(91,200,107,0.3)',
            borderRadius: 'var(--r-lg)',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            color: 'var(--c-success)',
          }}>
            <Zap size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Combo đang hoạt động — Người dùng sẽ thấy tùy chọn chọn nhiều món!
            </span>
          </div>
        ) : (
          <div style={{
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid var(--c-border-light)',
            borderRadius: 'var(--r-lg)',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            color: 'var(--c-text-muted)',
          }}>
            <Info size={16} />
            <span style={{ fontSize: '0.85rem' }}>
              Bật combo để người dùng gọi chọn nhiều món với giá ưu đãi.
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Tên combo */}
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--c-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Tên combo
            </label>
            <input
              className="input"
              placeholder="Ví dụ: Combo 3 món, Cơm phần..."
              value={rule.name}
              onChange={e => update({ name: e.target.value })}
            />
          </div>

          {/* Số món tối thiểu */}
          <div className="input-group">
            <label style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--c-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Số món cần chọn
            </label>
            <input
              className="input"
              type="number"
              min={1} max={10}
              value={rule.required_items}
              onChange={e => update({ required_items: Math.max(1, parseInt(e.target.value) || 1) })}
              style={{ fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--c-text-muted)', marginTop: 4 }}>
              Chọn đủ số này → áp giá combo
            </div>
          </div>

          {/* Giá combo */}
          <div className="input-group">
            <label style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--c-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Giá combo (VNĐ)
            </label>
            <input
              className="input"
              type="number"
              step={1000}
              min={0}
              value={rule.combo_price}
              onChange={e => update({ combo_price: parseInt(e.target.value) || 0 })}
              style={{ fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--c-text-muted)', marginTop: 4 }}>
              ≈ {pricePerItem.toLocaleString()}đ/món
            </div>
          </div>

          {/* Mô tả */}
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--c-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Mô tả hiển thị (tuỳ chọn)
            </label>
            <input
              className="input"
              placeholder="Ví dụ: Chọn đủ 3 món để hưởng giá ưu đãi!"
              value={rule.description || ''}
              onChange={e => update({ description: e.target.value })}
            />
          </div>
        </div>

        {/* Live Preview */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(201,116,147,0.08), rgba(212,168,83,0.05))',
          border: '1px solid var(--c-primary-light)',
          borderRadius: 'var(--r-xl)',
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--c-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
            👁 Xem trước combo
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--c-text)' }}>
                {rule.name || 'Tên combo...'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)', marginTop: 4 }}>
                {rule.description || `Chọn ${rule.required_items} món bất kỳ từ thực đơn`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '1.5rem', fontWeight: 900,
                color: 'var(--c-primary)',
                background: 'linear-gradient(135deg, var(--c-primary), var(--c-accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {rule.combo_price.toLocaleString()}đ
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--c-text-muted)', fontWeight: 700 }}>
                cho {rule.required_items} món
              </div>
            </div>
          </div>

          {/* Item slots preview */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {Array.from({ length: rule.required_items }).map((_, i) => (
              <div key={i} style={{
                flex: '0 0 auto',
                padding: '4px 14px',
                background: i < 2 ? 'var(--c-primary)' : 'var(--c-primary-soft)',
                color: i < 2 ? '#fff' : 'var(--c-primary)',
                borderRadius: 'var(--r-full)',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: '2px solid var(--c-primary)',
              }}>
                Món {i + 1} {i < 2 ? '✓' : '○'}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleReset}
            style={{ fontSize: '0.85rem' }}
          >
            Đặt lại mặc định
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!isDirty}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: isDirty ? 1 : 0.6,
            }}
          >
            <Save size={16} />
            {isDirty ? 'Lưu cài đặt 🌸' : 'Đã lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}
