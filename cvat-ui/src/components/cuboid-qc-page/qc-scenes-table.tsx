// Copyright (C) 2026 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState, useMemo } from 'react';
import Table, { ColumnsType } from 'antd/lib/table';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Tag from 'antd/lib/tag';
import Button from 'antd/lib/button';
import Space from 'antd/lib/space';
import Tooltip from 'antd/lib/tooltip';
import Badge from 'antd/lib/badge';
import {
    SearchOutlined,
    EyeOutlined,
    LinkOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    WarningOutlined,
    FilterOutlined,
    FundProjectionScreenOutlined,
} from '@ant-design/icons';
import { QCErrorType, QC_ERROR_METADATA, SceneQCResult } from './qc-types';

interface Props {
    scenes: SceneQCResult[];
    activeErrorFilter: QCErrorType | 'all';
    onOpenSceneModal: (scene: SceneQCResult) => void;
}

export default function QCScenesTable({
    scenes,
    activeErrorFilter,
    onOpenSceneModal,
}: Props): JSX.Element {
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [riskFilter, setRiskFilter] = useState<string>('all');

    const filteredScenes = useMemo(() => {
        return scenes.filter((scene) => {
            // Filter by search keyword
            const matchesSearch =
                !searchKeyword ||
                scene.sceneName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                scene.location.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                scene.token.toLowerCase().includes(searchKeyword.toLowerCase());

            // Filter by error type if clicked in summary cards
            const matchesErrorFilter =
                activeErrorFilter === 'all' || scene.errorCounts[activeErrorFilter] > 0;

            // Filter by risk level
            const matchesRisk = riskFilter === 'all' || scene.riskLevel === riskFilter;

            return matchesSearch && matchesErrorFilter && matchesRisk;
        });
    }, [scenes, searchKeyword, activeErrorFilter, riskFilter]);

    const columns: ColumnsType<SceneQCResult> = [
        {
            title: 'Tên Scene & Địa điểm (nuScenes)',
            dataIndex: 'sceneName',
            key: 'sceneName',
            render: (_: string, record: SceneQCResult) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#1a1f36', fontSize: 14 }}>
                        {record.sceneName}
                    </div>
                    <div style={{ color: '#697386', fontSize: 12, marginTop: 2 }}>
                        📍 {record.location}
                    </div>
                    <div style={{ color: '#a0aec0', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>
                        Token: {record.token.slice(0, 16)}... | {record.frameCount} frames
                    </div>
                </div>
            ),
        },
        {
            title: 'Tổng Cuboid',
            dataIndex: 'totalCuboids',
            key: 'totalCuboids',
            width: 110,
            align: 'center',
            sorter: (a, b) => a.totalCuboids - b.totalCuboids,
            render: (total: number) => (
                <Tag color='default' style={{ fontWeight: 600, borderRadius: 10 }}>
                    {total} boxes
                </Tag>
            ),
        },
        {
            title: (
                <Tooltip title={QC_ERROR_METADATA[QCErrorType.FEW_LIDAR_POINTS].description}>
                    <span style={{ color: '#d46b08' }}>
                        ● {QC_ERROR_METADATA[QCErrorType.FEW_LIDAR_POINTS].labelVi}
                    </span>
                </Tooltip>
            ),
            key: 'fewLidarPoints',
            width: 140,
            align: 'center',
            sorter: (a, b) => a.errorCounts[QCErrorType.FEW_LIDAR_POINTS] - b.errorCounts[QCErrorType.FEW_LIDAR_POINTS],
            render: (_: any, record: SceneQCResult) => {
                const count = record.errorCounts[QCErrorType.FEW_LIDAR_POINTS];
                return count > 0 ? (
                    <span className='qc-error-tag few-lidar'>
                        {count} lỗi
                    </span>
                ) : (
                    <span style={{ color: '#b0b7c3', fontSize: 12 }}>—</span>
                );
            },
        },
        {
            title: (
                <Tooltip title={QC_ERROR_METADATA[QCErrorType.IRRATIONAL_SIZE].description}>
                    <span style={{ color: '#cf1322' }}>
                        ● {QC_ERROR_METADATA[QCErrorType.IRRATIONAL_SIZE].labelVi}
                    </span>
                </Tooltip>
            ),
            key: 'irrationalSize',
            width: 160,
            align: 'center',
            sorter: (a, b) => a.errorCounts[QCErrorType.IRRATIONAL_SIZE] - b.errorCounts[QCErrorType.IRRATIONAL_SIZE],
            render: (_: any, record: SceneQCResult) => {
                const count = record.errorCounts[QCErrorType.IRRATIONAL_SIZE];
                return count > 0 ? (
                    <span className='qc-error-tag irrational-size'>
                        {count} lỗi
                    </span>
                ) : (
                    <span style={{ color: '#b0b7c3', fontSize: 12 }}>—</span>
                );
            },
        },
        {
            title: (
                <Tooltip title={QC_ERROR_METADATA[QCErrorType.OVERLAPPING_CUBOIDS].description}>
                    <span style={{ color: '#531dab' }}>
                        ● {QC_ERROR_METADATA[QCErrorType.OVERLAPPING_CUBOIDS].labelVi}
                    </span>
                </Tooltip>
            ),
            key: 'overlappingCuboids',
            width: 140,
            align: 'center',
            sorter: (a, b) => a.errorCounts[QCErrorType.OVERLAPPING_CUBOIDS] - b.errorCounts[QCErrorType.OVERLAPPING_CUBOIDS],
            render: (_: any, record: SceneQCResult) => {
                const count = record.errorCounts[QCErrorType.OVERLAPPING_CUBOIDS];
                return count > 0 ? (
                    <span className='qc-error-tag overlapping'>
                        {count} lỗi
                    </span>
                ) : (
                    <span style={{ color: '#b0b7c3', fontSize: 12 }}>—</span>
                );
            },
        },
        {
            title: (
                <Tooltip title={QC_ERROR_METADATA[QCErrorType.OPPOSITE_HEADING].description}>
                    <span style={{ color: '#08979c' }}>
                        ● {QC_ERROR_METADATA[QCErrorType.OPPOSITE_HEADING].labelVi}
                    </span>
                </Tooltip>
            ),
            key: 'oppositeHeading',
            width: 160,
            align: 'center',
            sorter: (a, b) => a.errorCounts[QCErrorType.OPPOSITE_HEADING] - b.errorCounts[QCErrorType.OPPOSITE_HEADING],
            render: (_: any, record: SceneQCResult) => {
                const count = record.errorCounts[QCErrorType.OPPOSITE_HEADING];
                return count > 0 ? (
                    <span className='qc-error-tag opposite-heading'>
                        {count} lỗi
                    </span>
                ) : (
                    <span style={{ color: '#b0b7c3', fontSize: 12 }}>—</span>
                );
            },
        },
        {
            title: 'Tổng lỗi / Tỉ lệ',
            key: 'totalErrors',
            width: 130,
            align: 'center',
            sorter: (a, b) => a.errorCounts.total - b.errorCounts.total,
            render: (_: any, record: SceneQCResult) => {
                const total = record.errorCounts.total;
                const rate = ((total / record.totalCuboids) * 100).toFixed(1);
                return (
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: total > 0 ? '#cf1322' : '#52c41a' }}>
                            {total} lỗi
                        </div>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>({rate}%)</div>
                    </div>
                );
            },
        },
        {
            title: 'Mức rủi ro',
            dataIndex: 'riskLevel',
            key: 'riskLevel',
            width: 120,
            align: 'center',
            render: (level: string) => {
                switch (level) {
                    case 'high':
                        return <Tag color='error'>Cảnh báo cao</Tag>;
                    case 'medium':
                        return <Tag color='warning'>Trung bình</Tag>;
                    case 'low':
                        return <Tag color='processing'>Thấp</Tag>;
                    case 'clean':
                        return (
                            <Tag color='success' icon={<CheckCircleOutlined />}>
                                Chuẩn
                            </Tag>
                        );
                    default:
                        return <Tag>{level}</Tag>;
                }
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 180,
            align: 'center',
            render: (_: any, record: SceneQCResult) => (
                <Space size='small' onClick={(e) => e.stopPropagation()}>
                    <Button
                        type='primary'
                        size='small'
                        icon={<EyeOutlined />}
                        onClick={() => onOpenSceneModal(record)}
                        style={{ borderRadius: 6 }}
                    >
                        Chi tiết ({record.suspectedCuboids.length})
                    </Button>
                    <Tooltip title={`Mở CVAT Task #${record.taskId} Job #${record.jobId} trên 3D Workspace`}>
                        <Button
                            size='small'
                            icon={<LinkOutlined />}
                            href={`/tasks/${record.taskId}/jobs/${record.jobId}`}
                            target='_blank'
                            rel='noreferrer'
                            style={{ borderRadius: 6 }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className='cvat-cuboid-qc-table-card'>
            <div className='qc-table-top-bar'>
                <div className='qc-table-title'>
                    <FundProjectionScreenOutlined style={{ color: '#1890ff' }} />
                    <span>Bảng thống kê chi tiết các Scenes ({filteredScenes.length} scenes)</span>
                    {activeErrorFilter !== 'all' && (
                        <Tag
                            closable
                            color={QC_ERROR_METADATA[activeErrorFilter].badgeColor}
                            style={{ marginLeft: 8 }}
                        >
                            Đang lọc: {QC_ERROR_METADATA[activeErrorFilter].labelVi}
                        </Tag>
                    )}
                </div>

                <div className='qc-table-filters'>
                    <Input
                        placeholder='Tìm kiếm Scene theo tên, vị trí, token...'
                        prefix={<SearchOutlined />}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        style={{ width: 260 }}
                        allowClear
                    />

                    <Select
                        value={riskFilter}
                        onChange={(val) => setRiskFilter(val)}
                        style={{ width: 150 }}
                        options={[
                            { value: 'all', label: 'Tất cả mức rủi ro' },
                            { value: 'high', label: 'Cảnh báo cao' },
                            { value: 'medium', label: 'Mức trung bình' },
                            { value: 'low', label: 'Mức thấp' },
                            { value: 'clean', label: 'Đạt chuẩn (Clean)' },
                        ]}
                    />
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={filteredScenes}
                rowKey='id'
                pagination={{ pageSize: 10, showTotal: (total) => `Tổng cộng ${total} scenes` }}
                onRow={(record) => ({
                    onClick: () => onOpenSceneModal(record),
                })}
            />
        </div>
    );
}
