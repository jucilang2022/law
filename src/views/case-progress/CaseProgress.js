import React, { useState } from 'react';
import { Card, Input, Button, Table, Tag, Typography, Space, message } from 'antd';
import { SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './CaseProgress.css';

const { Title } = Typography;

export default function CaseProgress() {
    const [caseNumber, setCaseNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [caseInfo, setCaseInfo] = useState(null);
    const history = useHistory();
    const location = useLocation();

    // ... existing code ...

    return (
        <div className="case-progress-container">
            <Card className="case-progress-card">
                <div className="case-progress-header">
                    {location.state?.showBackButton && (
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => history.goBack()}
                            className="back-button"
                        >
                            返回
                        </Button>
                    )}
                    <Title level={3}>案件进度查询</Title>
                </div>
                <div className="search-section">
                    <Input
                        placeholder="请输入案件编号"
                        value={caseNumber}
                        onChange={(e) => setCaseNumber(e.target.value)}
                        prefix={<SearchOutlined />}
                        className="case-number-input"
                    />
                    <Button
                        type="primary"
                        onClick={handleSearch}
                        loading={loading}
                        className="search-button"
                    >
                        查询
                    </Button>
                </div>
                {/* ... rest of the code ... */}
            </Card>
        </div>
    );
} 