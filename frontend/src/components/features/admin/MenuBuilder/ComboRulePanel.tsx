import { useState, useEffect } from 'react';
import { Zap, ToggleLeft, Save, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { menuApi } from '@/api';
import type { ComboRule, MenuCategory } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  sessionId: string;
  sessionName: string;
  categories: MenuCategory[];
  initialRule?: ComboRule | null;
  onSaved?: () => void;
}

interface CatRule {
  category_id: string;
  count: number;
}

export default function ComboRulePanel({ sessionId, categories, initialRule, onSaved }: Props) {
  const [rule, setRule] = useState<ComboRule>({
    session_id: sessionId,
    name: 'Combo tiêu chuẩn',
    required_items: 3,
    combo_price: 35000,
    is_active: false,
    description: 'Chọn đủ các món theo quy định để được giá combo!',
    category_rules: '[]'
  });

  const [catRules, setCatRules] = useState<CatRule[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialRule) {
      setRule(initialRule);
      try {
        const parsed = JSON.parse(initialRule.category_rules || '[]');
        setCatRules(parsed);
      } catch {
        setCatRules([]);
      }
    }
  }, [initialRule]);

  const update = (patch: Partial<ComboRule>) => {
    setRule(prev => ({ ...prev, ...patch }));
    setIsDirty(true);
  };

  const updateCatRule = (catId: string, count: number) => {
    setCatRules(prev => {
      const idx = prev.findIndex(r => r.category_id === catId);
      let next = [...prev];
      if (idx >= 0) {
        if (count <= 0) next = next.filter(r => r.category_id !== catId);
        else next[idx] = { category_id: catId, count };
      } else if (count > 0) {
        next.push({ category_id: catId, count });
      }
      
      // Update total required items based on cat rules
      const total = next.reduce((s, r) => s + r.count, 0);
      update({ required_items: total, category_rules: JSON.stringify(next) });
      return next;
    });
  };

  const handleSave = async () => {
    try {
      const payload = { ...rule, category_rules: JSON.stringify(catRules) };
      await menuApi.saveComboRule(sessionId, payload);
      setIsDirty(false);
      toast.success('Đã lưu cài đặt combo! 🎉');
      onSaved?.();
    } catch {
      toast.error('Lỗi khi lưu cài đặt combo');
    }
  };

  return (
    <div style={{
      background: 'var(--c-surface)',
      borderRadius: 'var(--r-2xl)',
      border: '2px solid var(--c-border-light)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-xl)',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-lg)',
            background: 'rgba(240,192,64,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(240,192,64,0.3)'
          }}>
            <Zap size={22} color="#f0c040" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', fontWeight: 800 }}>THIẾT LẬP COMBO THÔNG MINH</div>
            <div style={{ color: '#fff', fontWeight: 850, fontSize: '1.1rem' }}>Quy tắc chọn món</div>
          </div>
        </div>
        <button
            type="button"
            onClick={() => update({ is_active: !rule.is_active })}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: rule.is_active ? 'var(--c-success)' : 'rgba(255,255,255,0.1)',
              border: 'none', borderRadius: 'var(--r-full)',
              padding: '8px 20px', cursor: 'pointer',
              color: '#fff', fontSize: '0.85rem', fontWeight: 800,
              transition: 'all 0.2s ease',
            }}
          >
            {rule.is_active ? <><CheckCircle2 size={18} /> ĐANG BẬT</> : <><ToggleLeft size={18} /> ĐANG TẮT</>}
          </button>
      </div>

      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        
        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div className="input-group">
            <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)', marginBottom: 8, display: 'block' }}>TÊN COMBO</label>
            <input className="input" value={rule.name} onChange={e => update({ name: e.target.value })} placeholder="Ví dụ: Combo Cơm Trưa 35k" />
          </div>
          <div className="input-group">
            <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)', marginBottom: 8, display: 'block' }}>GIÁ COMBO (VNĐ)</label>
            <input className="input" type="number" step={1000} value={rule.combo_price} onChange={e => update({ combo_price: parseInt(e.target.value) || 0 })} style={{ fontWeight: 800, fontSize: '1.1rem' }} />
          </div>
        </div>

        {/* Category Rules Selection */}
        <div style={{ background: 'var(--c-bg)', borderRadius: 'var(--r-xl)', padding: '24px', border: '1px solid var(--c-border-light)' }}>
          <label style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--c-text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            🍱 Cấu trúc Combo (Số lượng món mỗi nhóm)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {categories.map(cat => {
              const currentRule = catRules.find(r => r.category_id === cat.id);
              const count = currentRule?.count || 0;
              return (
                <div key={cat.id} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '12px 16px', background: count > 0 ? '#fff' : 'transparent',
                  border: `1px solid ${count > 0 ? 'var(--c-primary-light)' : 'var(--c-border-light)'}`,
                  borderRadius: 'var(--r-lg)', transition: 'all 0.2s'
                }}>
                  <div style={{ fontWeight: 700, color: count > 0 ? 'var(--c-primary-dark)' : 'var(--c-text-muted)' }}>{cat.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <button type="button" onClick={() => updateCatRule(cat.id, count - 1)} className="btn-icon" style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff' }}><Minus size={14}/></button>
                    <span style={{ minWidth: 30, textAlign: 'center', fontWeight: 900, fontSize: '1.1rem', color: count > 0 ? 'var(--c-primary)' : 'var(--c-text-muted)' }}>{count}</span>
                    <button type="button" onClick={() => updateCatRule(cat.id, count + 1)} className="btn-icon" style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff' }}><Plus size={14}/></button>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--c-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ fontSize: '0.9rem', color: 'var(--c-text-muted)' }}>Tổng số món trong combo:</span>
             <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--c-primary)' }}>{rule.required_items}</span>
          </div>
        </div>

        {/* Description */}
        <div className="input-group">
          <label style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--c-primary)', marginBottom: 8, display: 'block' }}>MÔ TẢ HIỂN THỊ</label>
          <textarea className="input" rows={2} value={rule.description} onChange={e => update({ description: e.target.value })} placeholder="Ví dụ: Chọn 1 mặn, 1 phụ, 1 rau để có giá ưu đãi!" style={{ resize: 'none' }} />
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={!isDirty}
            style={{ padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 10, fontSize: '1rem' }}
          >
            <Save size={18} /> {isDirty ? 'Lưu cấu hình 🌸' : '✓ Đã lưu cấu hình'}
          </button>
        </div>
      </div>
    </div>
  );
}
