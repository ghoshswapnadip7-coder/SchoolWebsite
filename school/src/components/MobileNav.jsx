import React from 'react';

const MobileNav = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '10px 0',
            zIndex: 1000,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
        }}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        color: activeTab === tab.id ? 'var(--primary)' : '#64748b',
                        fontSize: '0.7rem',
                        fontWeight: activeTab === tab.id ? 700 : 400,
                        cursor: 'pointer',
                        width: '100%',
                        position: 'relative'
                    }}
                >
                    <tab.icon size={20} />
                    <span>{tab.label}</span>
                    {tab.badge > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: -2,
                            right: 'calc(50% - 14px)',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#ef4444',
                            border: '1px solid white'
                        }}></div>
                    )}
                </button>
            ))}
        </div>
    );
};

export default MobileNav;
