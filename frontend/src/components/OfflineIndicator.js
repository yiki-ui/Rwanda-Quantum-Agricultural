import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showIndicator, setShowIndicator] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowIndicator(true);
            // Hide indicator after 3 seconds
            setTimeout(() => setShowIndicator(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowIndicator(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Show indicator initially if offline
        if (!navigator.onLine) {
            setShowIndicator(true);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showIndicator) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                background: isOnline ? 'rgba(0, 255, 0, 0.95)' : 'rgba(255, 68, 68, 0.95)',
                color: isOnline ? '#000' : '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                fontWeight: '500',
                fontSize: '14px',
                animation: 'slideDown 0.3s ease-out',
            }}
        >
            {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
            <span>
                {isOnline ? 'Back online - syncing data...' : 'Offline mode - using cached data'}
            </span>
        </div>
    );
};

export default OfflineIndicator;
