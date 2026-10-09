// Copyright (C) 2026 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Row from 'antd/lib/grid/row';
import Col from 'antd/lib/grid/col';
import Button from 'antd/lib/button';
import Tag from 'antd/lib/tag';
import Space from 'antd/lib/space';
import {
    WarningOutlined,
    DotChartOutlined,
    ColumnWidthOutlined,
    AppstoreOutlined,
    SwapOutlined,
    DownloadOutlined,
    ReloadOutlined,
    LinkOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { QCErrorType, QC_ERROR_METADATA, QCSessionSummary } from './qc-types';

interface Props {
    summary: QCSessionSummary;
    activeErrorFilter: QCErrorType | 'all';
    onFilterChange: (type: QCErrorType | 'all') => void;
    onReset: () => void;
}

export default function QCSummaryCards({
    summary,
    activeErrorFilter,
    onFilterChange,
    onReset,
}: Props): JSX.Element {
    const handleExportJson = (): void => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(summary, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `QC_Report_${summary.cvatTaskId}_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    return (
        <div style={{ marginBottom: 24 }}>
            {/* Session Info Bar */}
            <div
                style={{
                    background: '#ffffff',
                    border: '1px solid #e3e8ee',
                    borderRadius: 12,
                    padding: '16px 20px',
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                }}
            >
                <Space size='middle' wrap>
                    <div>
                        <span style={{ color: '#697386', fontSize: 12, display: 'block' }}>Tập dữ liệu:</span>
                        <strong style={{ fontSize: 15, color: '#1a1f36' }}>{summary.datasetName}</strong>
                    </div>
                    <div style={{ borderLeft: '1px solid #e3e8ee', paddingLeft: 16 }}>
                        <span style={{ color: '#697386', fontSize: 12, display: 'block' }}>CVAT Task liên kết:</span>
                        <a
                            href={`/tasks/${summary.cvatTaskId}`}
                            target='_blank'
                            rel='noreferrer'
                            style={{ fontWeight: 600, color: '#1890ff', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                            #{summary.cvatTaskId} - {summary.cvatTaskName}
                            <LinkOutlined />
                        </a>
                    </div>
                    <div style={{ borderLeft: '1px solid #e3e8ee', paddingLeft: 16 }}>
                        <span style={{ color: '#697386', fontSize: 12, display: 'block' }}>Thời gian thực hiện:</span>
                        <span style={{ fontSize: 13, color: '#333' }}>{summary.uploadedAt}</span>
                    </div>
                    <div style={{ borderLeft: '1px solid #e3e8ee', paddingLeft: 16 }}>
                        <span style={{ color: '#697386', fontSize: 12, display: 'block' }}>Trạng thái phân tích:</span>
                        <Tag color='success' icon={<CheckCircleOutlined />}>
                            Hoàn tất kiểm tra
                        </Tag>
                    </div>
                </Space>

                <Space>
                    <Button icon={<DownloadOutlined />} onClick={handleExportJson}>
                        Xuất báo cáo (JSON)
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={onReset}>
                        Phân tích Dataset khác
                    </Button>
                </Space>
            </div>

            {/* 4 Interactive Category Filter Cards */}
            <div className='cvat-cuboid-qc-metrics-grid'>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <div
                            className={`qc-stat-card few-lidar ${
                                activeErrorFilter === QCErrorType.FEW_LIDAR_POINTS ? 'active-filter' : ''
                            }`}
                            onClick={() =>
                                onFilterChange(
                                    activeErrorFilter === QCErrorType.FEW_LIDAR_POINTS
                                        ? 'all'
                                        : QCErrorType.FEW_LIDAR_POINTS,
                                )
                            }
                        >
                            <div className='qc-stat-header'>
                                <span className='qc-stat-label'>
                                    {QC_ERROR_METADATA[QCErrorType.FEW_LIDAR_POINTS].labelVi}
                                </span>
                                <DotChartOutlined className='qc-stat-icon' style={{ color: '#fa8c16' }} />
                            </div>
                            <div className='qc-stat-value' style={{ color: '#d46b08' }}>
                                {summary.errorCounts[QCErrorType.FEW_LIDAR_POINTS]}
                            </div>
                            <div className='qc-stat-desc'>
                                Bounding box có số điểm phản xạ {'<'} ngưỡng
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <div
                            className={`qc-stat-card irrational-size ${
                                activeErrorFilter === QCErrorType.IRRATIONAL_SIZE ? 'active-filter' : ''
                            }`}
                            onClick={() =>
                                onFilterChange(
                                    activeErrorFilter === QCErrorType.IRRATIONAL_SIZE
                                        ? 'all'
                                        : QCErrorType.IRRATIONAL_SIZE,
                                )
                            }
                        >
                            <div className='qc-stat-header'>
                                <span className='qc-stat-label'>
                                    {QC_ERROR_METADATA[QCErrorType.IRRATIONAL_SIZE].labelVi}
                                </span>
                                <ColumnWidthOutlined className='qc-stat-icon' style={{ color: '#f5222d' }} />
                            </div>
                            <div className='qc-stat-value' style={{ color: '#cf1322' }}>
                                {summary.errorCounts[QCErrorType.IRRATIONAL_SIZE]}
                            </div>
                            <div className='qc-stat-desc'>
                                Dài/Rộng/Cao lệch bất thường so với phân phối class
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <div
                            className={`qc-stat-card overlapping ${
                                activeErrorFilter === QCErrorType.OVERLAPPING_CUBOIDS ? 'active-filter' : ''
                            }`}
                            onClick={() =>
                                onFilterChange(
                                    activeErrorFilter === QCErrorType.OVERLAPPING_CUBOIDS
                                        ? 'all'
                                        : QCErrorType.OVERLAPPING_CUBOIDS,
                                )
                            }
                        >
                            <div className='qc-stat-header'>
                                <span className='qc-stat-label'>
                                    {QC_ERROR_METADATA[QCErrorType.OVERLAPPING_CUBOIDS].labelVi}
                                </span>
                                <AppstoreOutlined className='qc-stat-icon' style={{ color: '#722ed1' }} />
                            </div>
                            <div className='qc-stat-value' style={{ color: '#531dab' }}>
                                {summary.errorCounts[QCErrorType.OVERLAPPING_CUBOIDS]}
                            </div>
                            <div className='qc-stat-desc'>
                                Hai hoặc nhiều cuboid chồng chéo nhau trong không gian 3D
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <div
                            className={`qc-stat-card opposite-heading ${
                                activeErrorFilter === QCErrorType.OPPOSITE_HEADING ? 'active-filter' : ''
                            }`}
                            onClick={() =>
                                onFilterChange(
                                    activeErrorFilter === QCErrorType.OPPOSITE_HEADING
                                        ? 'all'
                                        : QCErrorType.OPPOSITE_HEADING,
                                )
                            }
                        >
                            <div className='qc-stat-header'>
                                <span className='qc-stat-label'>
                                    {QC_ERROR_METADATA[QCErrorType.OPPOSITE_HEADING].labelVi}
                                </span>
                                <SwapOutlined className='qc-stat-icon' style={{ color: '#13c2c2' }} />
                            </div>
                            <div className='qc-stat-value' style={{ color: '#08979c' }}>
                                {summary.errorCounts[QCErrorType.OPPOSITE_HEADING]}
                            </div>
                            <div className='qc-stat-desc'>
                                Góc quay yaw ngược hướng vận tốc di chuyển
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
}
