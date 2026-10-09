// Copyright (C) 2026 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState, useMemo } from 'react';
import Modal from 'antd/lib/modal';
import Table, { ColumnsType } from 'antd/lib/table';
import Tag from 'antd/lib/tag';
import Button from 'antd/lib/button';
import Space from 'antd/lib/space';
import Tooltip from 'antd/lib/tooltip';
import Radio from 'antd/lib/radio';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Badge from 'antd/lib/badge';
import Empty from 'antd/lib/empty';
import {
    LinkOutlined,
    SearchOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    WarningOutlined,
    CloseCircleOutlined,
    FundProjectionScreenOutlined,
    CompassOutlined,
    DotChartOutlined,
    ColumnWidthOutlined,
    AppstoreOutlined,
    SwapOutlined,
    AimOutlined,
} from '@ant-design/icons';
import {
    QCErrorType,
    QC_ERROR_METADATA,
    SceneQCResult,
    SuspectedCuboid,
} from './qc-types';

interface Props {
    scene: SceneQCResult | null;
    visible: boolean;
    onClose: () => void;
}

export default function QCSceneDetailModal({
    scene,
    visible,
    onClose,
}: Props): JSX.Element {
    const [selectedErrorType, setSelectedErrorType] = useState<QCErrorType | 'all'>('all');
    const [searchTrackId, setSearchTrackId] = useState<string>('');
    const [cuboidsState, setCuboidsState] = useState<Record<string, SuspectedCuboid['status']>>({});

    const filteredCuboids = useMemo(() => {
        if (!scene) return [];
        return scene.suspectedCuboids.filter((cuboid) => {
            const matchesType =
                selectedErrorType === 'all' || cuboid.errorType === selectedErrorType;
            const matchesSearch =
                !searchTrackId ||
                cuboid.trackId.toLowerCase().includes(searchTrackId.toLowerCase()) ||
                cuboid.label.toLowerCase().includes(searchTrackId.toLowerCase()) ||
                cuboid.frame.toString().includes(searchTrackId);
            return matchesType && matchesSearch;
        });
    }, [scene, selectedErrorType, searchTrackId]);

    if (!scene) return <></>;

    const handleStatusChange = (cuboidId: string, status: SuspectedCuboid['status']): void => {
        setCuboidsState((prev) => ({
            ...prev,
            [cuboidId]: status,
        }));
    };

    const renderErrorBadge = (errorType: QCErrorType): JSX.Element => {
        const meta = QC_ERROR_METADATA[errorType];
        let className = 'qc-error-tag';
        let icon = <WarningOutlined />;

        if (errorType === QCErrorType.FEW_LIDAR_POINTS) {
            className += ' few-lidar';
            icon = <DotChartOutlined />;
        } else if (errorType === QCErrorType.IRRATIONAL_SIZE) {
            className += ' irrational-size';
            icon = <ColumnWidthOutlined />;
        } else if (errorType === QCErrorType.OVERLAPPING_CUBOIDS) {
            className += ' overlapping';
            icon = <AppstoreOutlined />;
        } else if (errorType === QCErrorType.OPPOSITE_HEADING) {
            className += ' opposite-heading';
            icon = <SwapOutlined />;
        }

        return (
            <span className={className}>
                {icon}
                {meta.labelVi}
            </span>
        );
    };

    const columns: ColumnsType<SuspectedCuboid> = [
        {
            title: 'Track ID / Object',
            dataIndex: 'trackId',
            key: 'trackId',
            width: 140,
            render: (trackId: string, record: SuspectedCuboid) => (
                <div>
                    <span style={{ fontWeight: 600, color: '#1890ff', fontFamily: 'monospace' }}>
                        #{trackId}
                    </span>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>ID: {record.id}</div>
                </div>
            ),
        },
        {
            title: 'Frame & Time',
            key: 'frame',
            width: 120,
            render: (_: any, record: SuspectedCuboid) => (
                <div>
                    <strong style={{ color: '#262626' }}>Frame {record.frame}</strong>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.timestamp}</div>
                </div>
            ),
        },
        {
            title: 'Class',
            dataIndex: 'label',
            key: 'label',
            width: 110,
            render: (label: string) => {
                let color = 'blue';
                if (label === 'pedestrian') color = 'magenta';
                else if (label === 'truck' || label === 'bus') color = 'orange';
                else if (label === 'motorcycle' || label === 'bicycle') color = 'green';
                return (
                    <Tag color={color} style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                        {label}
                    </Tag>
                );
            },
        },
        {
            title: 'Loại lỗi phát hiện',
            dataIndex: 'errorType',
            key: 'errorType',
            width: 180,
            render: (type: QCErrorType) => renderErrorBadge(type),
        },
        {
            title: 'Chẩn đoán chi tiết & Thông số hình học',
            key: 'diagnosis',
            render: (_: any, record: SuspectedCuboid) => (
                <div>
                    <div style={{ color: '#262626', fontSize: 13, marginBottom: 4 }}>
                        {record.reason}
                    </div>
                    {/* Metrics info pill */}
                    <div style={{ fontSize: 11, color: '#595959', background: '#fafafa', padding: '4px 8px', borderRadius: 4, display: 'inline-block' }}>
                        {record.metrics.pointCount !== undefined && (
                            <span>Điểm LiDAR: <b>{record.metrics.pointCount}</b> (ngưỡng min: {record.metrics.minPointThreshold})</span>
                        )}
                        {record.metrics.dimensions && (
                            <span>
                                Kích thước: <b>{record.metrics.dimensions.length}m</b> (D) x <b>{record.metrics.dimensions.width}m</b> (R) x <b>{record.metrics.dimensions.height}m</b> (C)
                            </span>
                        )}
                        {record.metrics.overlapIou !== undefined && (
                            <span>
                                3D IoU Overlap: <b>{(record.metrics.overlapIou * 100).toFixed(1)}%</b> với #{record.metrics.conflictingTrackId}
                            </span>
                        )}
                        {record.metrics.angleDeltaDeg !== undefined && (
                            <span>
                                Độ lệch hướng: <b>{record.metrics.angleDeltaDeg.toFixed(1)}°</b> (Yaw: {record.metrics.yawAngleDeg?.toFixed(1)}°, Velocity: {record.metrics.motionVectorDeg?.toFixed(1)}°)
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Liên kết CVAT',
            key: 'cvatLink',
            width: 150,
            align: 'center',
            render: (_: any, record: SuspectedCuboid) => (
                <Tooltip title={`Chuyển thẳng đến Frame ${record.frame} và focus đối tượng #${record.trackId} trên CVAT 3D Workspace`}>
                    <Button
                        type='link'
                        icon={<AimOutlined />}
                        href={record.cvatUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='cvat-cuboid-jump-link'
                        style={{ padding: 0 }}
                    >
                        Mở trên CVAT
                    </Button>
                </Tooltip>
            ),
        },
        {
            title: 'Trạng thái QC',
            key: 'status',
            width: 140,
            align: 'center',
            render: (_: any, record: SuspectedCuboid) => {
                const currentStatus = cuboidsState[record.id] || record.status;
                return (
                    <Select
                        size='small'
                        value={currentStatus}
                        onChange={(val) => handleStatusChange(record.id, val)}
                        style={{ width: 120 }}
                        options={[
                            { value: 'pending', label: '⏳ Cần sửa' },
                            { value: 'verified_bug', label: '❌ Xác nhận lỗi' },
                            { value: 'false_positive', label: '✅ Bỏ qua (FP)' },
                        ]}
                    />
                );
            },
        },
    ];

    return (
        <Modal
            className='cvat-cuboid-qc-detail-modal'
            title={null}
            open={visible}
            onCancel={onClose}
            width={1120}
            footer={[
                <Button key='close' onClick={onClose}>
                    Đóng cửa sổ
                </Button>,
                <Button
                    key='open-scene-cvat'
                    type='primary'
                    icon={<FundProjectionScreenOutlined />}
                    href={`/tasks/${scene.taskId}/jobs/${scene.jobId}`}
                    target='_blank'
                    rel='noreferrer'
                >
                    Mở toàn bộ Scene này trên CVAT 3D
                </Button>,
            ]}
        >
            {/* Header banner */}
            <div className='modal-scene-header'>
                <div className='scene-meta-info'>
                    <div className='scene-title'>
                        {scene.sceneName}
                    </div>
                    <div className='scene-subtitle'>
                        <span>📍 {scene.location}</span>
                        <span>🎞️ {scene.frameCount} frames</span>
                        <span>📦 {scene.totalCuboids} cuboids</span>
                        <span>
                            ⚠️ {scene.errorCounts.total} lỗi nghi ngờ ({scene.suspectedCuboids.length} cuboid đã gắn cờ)
                        </span>
                    </div>
                </div>

                <Button
                    type='primary'
                    icon={<LinkOutlined />}
                    className='cvat-open-job-btn'
                    href={`/tasks/${scene.taskId}/jobs/${scene.jobId}`}
                    target='_blank'
                    rel='noreferrer'
                >
                    Mở CVAT Job #{scene.jobId}
                </Button>
            </div>

            {/* Filter toolbar inside modal */}
            <div className='modal-filter-bar'>
                <Radio.Group
                    value={selectedErrorType}
                    onChange={(e) => setSelectedErrorType(e.target.value)}
                    buttonStyle='solid'
                    size='small'
                >
                    <Radio.Button value='all'>
                        Tất cả ({scene.suspectedCuboids.length})
                    </Radio.Button>
                    <Radio.Button value={QCErrorType.FEW_LIDAR_POINTS}>
                        Ít điểm LiDAR ({scene.errorCounts[QCErrorType.FEW_LIDAR_POINTS]})
                    </Radio.Button>
                    <Radio.Button value={QCErrorType.IRRATIONAL_SIZE}>
                        Sai kích thước ({scene.errorCounts[QCErrorType.IRRATIONAL_SIZE]})
                    </Radio.Button>
                    <Radio.Button value={QCErrorType.OVERLAPPING_CUBOIDS}>
                        Chồng lấn ({scene.errorCounts[QCErrorType.OVERLAPPING_CUBOIDS]})
                    </Radio.Button>
                    <Radio.Button value={QCErrorType.OPPOSITE_HEADING}>
                        Ngược chiều ({scene.errorCounts[QCErrorType.OPPOSITE_HEADING]})
                    </Radio.Button>
                </Radio.Group>

                <Input
                    size='small'
                    placeholder='Tìm theo Track ID, nhãn, frame...'
                    prefix={<SearchOutlined />}
                    value={searchTrackId}
                    onChange={(e) => setSearchTrackId(e.target.value)}
                    style={{ width: 220 }}
                    allowClear
                />
            </div>

            {/* Suspected cuboids table */}
            {filteredCuboids.length > 0 ? (
                <Table
                    className='cuboids-table'
                    columns={columns}
                    dataSource={filteredCuboids}
                    rowKey='id'
                    size='middle'
                    pagination={{ pageSize: 6, showTotal: (t) => `Hiển thị ${t} cuboids nghi ngờ` }}
                />
            ) : (
                <Empty
                    description={
                        scene.suspectedCuboids.length === 0
                            ? 'Scene này hoàn toàn sạch lỗi (Clean Scene)! Tất cả cuboids đều đạt chuẩn QC.'
                            : 'Không tìm thấy cuboid nào phù hợp với bộ lọc hiện tại.'
                    }
                    style={{ margin: '40px 0' }}
                />
            )}
        </Modal>
    );
}
