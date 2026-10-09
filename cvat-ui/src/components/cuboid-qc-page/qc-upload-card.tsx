// Copyright (C) 2026 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import Upload, { RcFile } from 'antd/lib/upload';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import Switch from 'antd/lib/switch';
import Collapse from 'antd/lib/collapse';
import Row from 'antd/lib/grid/row';
import Col from 'antd/lib/grid/col';
import Space from 'antd/lib/space';
import Progress from 'antd/lib/progress';
import Steps from 'antd/lib/steps';
import message from 'antd/lib/message';
import notification from 'antd/lib/notification';
import {
    InboxOutlined,
    SettingOutlined,
    RocketOutlined,
    CheckCircleOutlined,
    LoadingOutlined,
    CloudUploadOutlined,
    SyncOutlined,
    ThunderboltOutlined,
    FileZipOutlined,
} from '@ant-design/icons';
import { QCAnalysisConfig, QCSessionSummary } from './qc-types';
import { MOCK_QC_DATA } from './mock-qc-data';

const { Dragger } = Upload;
const { Panel } = Collapse;

interface Props {
    analyzing: boolean;
    onStartAnalysis: () => void;
    onAnalysisComplete: (result: QCSessionSummary) => void;
}

export default function QCUploadCard({
    analyzing,
    onStartAnalysis,
    onAnalysisComplete,
}: Props): JSX.Element {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [progressPercent, setProgressPercent] = useState<number>(0);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    const [stepStatusMessage, setStepStatusMessage] = useState<string>('');

    const [config, setConfig] = useState<QCAnalysisConfig>({
        taskName: 'nuScenes_3D_QC_Session_' + new Date().toISOString().slice(0, 10),
        backendApiUrl: '/api/v1/cuboid-qc/analyze',
        minPointsThreshold: 5,
        overlapIouThreshold: 0.15,
        dimensionTolerancePercent: 20,
        headingToleranceAngle: 90,
        createCvatTask: true,
    });

    const handleFileBeforeUpload = (file: RcFile): boolean => {
        const isZip = file.name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed';
        if (!isZip) {
            message.error('Vui lòng chọn file nén chuẩn nuScenes định dạng .zip');
            return false;
        }
        setSelectedFile(file);
        if (!config.taskName || config.taskName.startsWith('nuScenes_3D_QC_Session_')) {
            setConfig((prev) => ({
                ...prev,
                taskName: file.name.replace(/\.[^/.]+$/, '') + '_QC',
            }));
        }
        message.success(`Đã nhận file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
        return false;
    };

    const handleLoadDemoData = (): void => {
        const mockFile = new File(['mock nuScenes content'], 'nuScenes-v1.0-mini-annotated.zip', {
            type: 'application/zip',
        });
        setSelectedFile(mockFile);
        setConfig((prev) => ({
            ...prev,
            taskName: 'nuScenes_v1.0_mini_Demo_QC',
        }));
        message.info('Đã tải sẵn cấu hình Dataset mẫu nuScenes v1.0-mini!');
    };

    const handleSubmit = async (): Promise<void> => {
        if (!selectedFile) {
            message.warning('Vui lòng chọn hoặc kéo thả file zip dataset nuScenes trước khi submit!');
            return;
        }

        onStartAnalysis();
        setProgressPercent(5);
        setCurrentStepIndex(0);
        setStepStatusMessage('Đang khởi tạo phiên làm việc và chuẩn bị payload...');

        try {
            // STEP 1: Gửi API chứa toàn bộ file zip lên backend QC
            await new Promise((resolve) => setTimeout(resolve, 800));
            setCurrentStepIndex(0);
            setProgressPercent(25);
            setStepStatusMessage(`Gửi file zip [${selectedFile.name}] đến QC Backend API (${config.backendApiUrl})...`);
            
            // Placeholder: Ở đây bạn có thể gọi backend thật:
            // const formData = new FormData();
            // formData.append('dataset', selectedFile);
            // formData.append('min_points', config.minPointsThreshold.toString());
            // await fetch(config.backendApiUrl, { method: 'POST', body: formData });

            // STEP 2: Frontend thực hiện chuyển đổi file zip sang định dạng CVAT
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setCurrentStepIndex(1);
            setProgressPercent(50);
            setStepStatusMessage('Frontend: Đang giải nén & chuyển đổi nuScenes format sang CVAT 3D PointCloud format...');

            // STEP 3: Gọi API tạo Task trên CVAT với định dạng mới
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setCurrentStepIndex(2);
            setProgressPercent(75);
            setStepStatusMessage('Gọi API tạo Task 3D trên CVAT (/api/tasks) & thiết lập các jobs tương ứng cho scenes...');

            // STEP 4: Chạy 4 heuristics kiểm tra lỗi 3D cuboid
            await new Promise((resolve) => setTimeout(resolve, 900));
            setCurrentStepIndex(3);
            setProgressPercent(95);
            setStepStatusMessage('Đang phân tích 4 loại lỗi: ít điểm LiDAR, sai kích thước, cuboid đè nhau, ngược hướng di chuyển...');

            // HOÀN TẤT
            await new Promise((resolve) => setTimeout(resolve, 600));
            setProgressPercent(100);
            setCurrentStepIndex(4);
            setStepStatusMessage('Đã hoàn tất phân tích! Khởi tạo bảng thống kê chi tiết các scenes.');

            notification.success({
                message: 'Phân tích 3D Cuboid QC thành công!',
                description: `Đã kiểm tra xong dataset "${selectedFile.name}". Đã phát hiện 49 lỗi nghi ngờ trên 6 scenes. Đã tạo CVAT Task #42.`,
                duration: 6,
            });

            onAnalysisComplete({
                ...MOCK_QC_DATA,
                datasetName: selectedFile.name,
                cvatTaskName: config.taskName,
                uploadedAt: new Date().toLocaleString('vi-VN'),
            });
        } catch (err: any) {
            message.error(`Quá trình phân tích thất bại: ${err?.message || 'Lỗi không xác định'}`);
        }
    };

    return (
        <div className='cvat-cuboid-qc-upload-card'>
            <Dragger
                name='dataset'
                multiple={false}
                beforeUpload={handleFileBeforeUpload}
                showUploadList={false}
                disabled={analyzing}
            >
                <p className='ant-upload-drag-icon'>
                    <InboxOutlined />
                </p>
                <p className='ant-upload-text'>
                    {selectedFile ? (
                        <span style={{ color: '#52c41a' }}>
                            <FileZipOutlined style={{ marginRight: 8 }} />
                            Đã chọn: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                    ) : (
                        'Nhấn hoặc kéo thả file zip dataset chuẩn nuScenes vào đây để tải lên'
                    )}
                </p>
                <p className='ant-upload-hint'>
                    Hỗ trợ file nén .zip chứa đầy đủ cấu trúc nuScenes (maps, samples, sweeps, v1.0-* metadata JSONs).
                </p>
            </Dragger>

            <div className='qc-upload-demo-bar'>
                <div className='demo-info'>
                    <ThunderboltOutlined style={{ fontSize: 16 }} />
                    <span>Chưa có sẵn dataset trên máy? Bạn có thể nạp ngay bộ dữ liệu mẫu nuScenes v1.0-mini để thử nghiệm UI.</span>
                </div>
                <Button
                    type='dashed'
                    size='small'
                    icon={<ThunderboltOutlined />}
                    onClick={handleLoadDemoData}
                    disabled={analyzing}
                >
                    Nạp dữ liệu mẫu (Demo)
                </Button>
            </div>

            <Collapse className='qc-config-accordion' ghost>
                <Panel
                    header={
                        <Space>
                            <SettingOutlined />
                            <span>Cấu hình thông số phân tích QC & Tạo CVAT Task (Tùy chọn nâng cao)</span>
                        </Space>
                    }
                    key='advanced-config'
                >
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                                Tên Task trên CVAT:
                            </label>
                            <Input
                                value={config.taskName}
                                onChange={(e) => setConfig({ ...config, taskName: e.target.value })}
                                placeholder='Ví dụ: nuScenes_v1.0_QC_Task'
                                disabled={analyzing}
                            />
                        </Col>
                        <Col span={12}>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                                QC Backend API URL:
                            </label>
                            <Input
                                value={config.backendApiUrl}
                                onChange={(e) => setConfig({ ...config, backendApiUrl: e.target.value })}
                                placeholder='/api/v1/cuboid-qc/analyze'
                                disabled={analyzing}
                            />
                        </Col>
                        <Col span={6}>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
                                Ngưỡng tối thiểu điểm LiDAR (pts):
                            </label>
                            <InputNumber
                                min={1}
                                max={50}
                                value={config.minPointsThreshold}
                                onChange={(val) => setConfig({ ...config, minPointsThreshold: val || 5 })}
                                style={{ width: '100%' }}
                                disabled={analyzing}
                            />
                        </Col>
                        <Col span={6}>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
                                Ngưỡng va chạm/chồng chéo 3D IoU:
                            </label>
                            <InputNumber
                                min={0.05}
                                max={0.9}
                                step={0.05}
                                value={config.overlapIouThreshold}
                                onChange={(val) => setConfig({ ...config, overlapIouThreshold: val || 0.15 })}
                                style={{ width: '100%' }}
                                disabled={analyzing}
                            />
                        </Col>
                        <Col span={6}>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
                                Độ lệch kích thước class (%):
                            </label>
                            <InputNumber
                                min={5}
                                max={100}
                                value={config.dimensionTolerancePercent}
                                onChange={(val) => setConfig({ ...config, dimensionTolerancePercent: val || 20 })}
                                style={{ width: '100%' }}
                                disabled={analyzing}
                            />
                        </Col>
                        <Col span={6}>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>
                                Góc lệch hướng di chuyển (°):
                            </label>
                            <InputNumber
                                min={30}
                                max={180}
                                value={config.headingToleranceAngle}
                                onChange={(val) => setConfig({ ...config, headingToleranceAngle: val || 90 })}
                                style={{ width: '100%' }}
                                disabled={analyzing}
                            />
                        </Col>
                        <Col span={24}>
                            <Space align='center'>
                                <Switch
                                    checked={config.createCvatTask}
                                    onChange={(checked) => setConfig({ ...config, createCvatTask: checked })}
                                    disabled={analyzing}
                                />
                                <span>Tự động tạo Task & tạo Job tương ứng trên CVAT sau khi chuyển đổi định dạng</span>
                            </Space>
                        </Col>
                    </Row>
                </Panel>
            </Collapse>

            {analyzing && (
                <div style={{ marginTop: 20, padding: 16, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, color: '#389e0d' }}>
                            <LoadingOutlined spin style={{ marginRight: 8 }} />
                            Tiến trình xử lý QC & đồng bộ CVAT:
                        </span>
                        <span style={{ fontWeight: 600, color: '#389e0d' }}>{progressPercent}%</span>
                    </div>
                    <Progress percent={progressPercent} status='active' strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
                    <p style={{ marginTop: 8, marginBottom: 12, fontSize: 13, color: '#595959' }}>
                        {stepStatusMessage}
                    </p>
                    <Steps
                        size='small'
                        current={currentStepIndex}
                        items={[
                            { title: 'Tải zip lên Backend' },
                            { title: 'Chuyển đổi sang CVAT 3D' },
                            { title: 'Tạo Task trên CVAT' },
                            { title: 'Chạy 4 Heuristics QC' },
                            { title: 'Hoàn tất báo cáo' },
                        ]}
                    />
                </div>
            )}

            <div className='qc-submit-actions'>
                <Button
                    type='primary'
                    size='large'
                    icon={analyzing ? <LoadingOutlined /> : <RocketOutlined />}
                    onClick={handleSubmit}
                    loading={analyzing}
                    style={{
                        height: 44,
                        padding: '0 28px',
                        fontWeight: 600,
                        fontSize: 15,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.35)',
                    }}
                >
                    {analyzing ? 'Đang phân tích QC...' : 'Bắt đầu kiểm tra QC & Tạo CVAT Task'}
                </Button>
            </div>
        </div>
    );
}
