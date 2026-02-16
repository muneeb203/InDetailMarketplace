// Debug component to show data source
export function DebugDataSource({ 
  detailersCount, 
  isFromSupabase 
}: { 
  detailersCount: number; 
  isFromSupabase: boolean;
}) {
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: isFromSupabase ? '#10b981' : '#f59e0b',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 9999,
        fontSize: '14px',
        fontWeight: '600'
      }}
    >
      {isFromSupabase ? '✅ LIVE DATA' : '⚠️ MOCK DATA'} - {detailersCount} detailers
    </div>
  );
}
