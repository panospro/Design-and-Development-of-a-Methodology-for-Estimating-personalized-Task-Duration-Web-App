import { IconButton, Tooltip } from '@mui/material';
import { Info } from '@mui/icons-material';

export const ChartWrapper = ({ children, title, info }) => {
    const containerStyle = {
        padding: '20px',
        margin: '10px',
        width: '100%',
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
        transition: 'all 0.3s ease-in-out',
        overflow: 'hidden',
        background: 'linear-gradient(to right, #222236, #3b3b5c)',
        color: '#f8f8f8',
        textShadow: '1px 1px 2px rgba(50, 50, 50, 0.8)',
        position: 'relative',
    };

    const handleMouseOver = (e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
    };

    const handleMouseOut = (e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
    };

    const titleStyle = {
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.8rem',
        transition: 'color 0.3s ease, transform 0.3s ease',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    };

    // Added a new style for the tooltip container
    const tooltipContainerStyle = { position: 'absolute', top: 10, right: 10 };

    return (
        <div style={containerStyle} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            <div style={titleStyle}>
                {title}
                <div style={tooltipContainerStyle}>
                    <Tooltip title={<span style={{ fontSize: '1.2rem' }}>{info}</span>} arrow>
                    <IconButton>
                        <Info color="primary" style={{ fontSize: '2.5rem' }} />
                    </IconButton>
                    </Tooltip>
                </div>
            </div>

            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {children}
            </div>
        </div>
    );
};
