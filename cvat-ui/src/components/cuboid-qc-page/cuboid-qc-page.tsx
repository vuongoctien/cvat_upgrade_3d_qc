// Copyright (C) 2026 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';
import React, { useState } from 'react';
import Button from 'antd/lib/button';
import Space from 'antd/lib/space';
import Tooltip from 'antd/lib/tooltip';
import {
    BoxPlotOutlined,
    QuestionCircleOutlined,
    ReloadOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';

import { QCErrorType, QCSessionSummary, SceneQCResult } from './qc-types';
import { MOCK_QC_DATA } from './mock-qc-data';
import QCUploadCard from './qc-upload-card';
import QCSummaryCards from './qc-summary-cards';
import QCScenesTable from './qc-scenes-table';
import QCSceneDetailModal from './qc-scene-detail-modal';

function CuboidQCPage(): JSX.Element {
    const [analyzing, setAnalyzing] = useState<boolean>(false);
    const [qcSummary, setQcSummary] = useState<QCSessionSummary | null>(null);
    const [activeErrorFilter, setActiveErrorFilter] = useState<QCErrorType | 'all'>('all');
    const [selectedScene, setSelectedScene] = useState<SceneQCResult | null>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const handleStartAnalysis = (): void => {
        setAnalyzing(true);
    };

    const handleAnalysisComplete = (result: QCSessionSummary): void => {
        setAnalyzing(false);
        setQcSummary(result);
        setActiveErrorFilter('all');
    };

    const handleOpenSceneModal = (scene: SceneQCResult): void => {
        setSelectedScene(scene);
        setModalVisible(true);
    };

    const handleCloseModal = (): void => {
        setModalVisible(false);
        setSelectedScene(null);
    };

    const handleReset = (): void => {
        setQcSummary(null);
        setActiveErrorFilter('all');
        setSelectedScene(null);
    };

    return (
        <div className='cvat-cuboid-qc-page'>
            {/* Header */}
            <div className='cvat-cuboid-qc-header'>
                <div>
                    <h1 className='cvat-cuboid-qc-title'>
                        <BoxPlotOutlined style={{ color: '#1890ff' }} />
                        Kiểm thử Chất lượng 3D Cuboid (nuScenes QC Tool)
                        <span className='qc-badge-pill'>AI / 3D QC Engine</span>
                    </h1>
                    <p className='cvat-cuboid-qc-subtitle'>
                        Công cụ tự động kiểm tra hình học 3D, mật độ điểm LiDAR và tạo Task trên CVAT cho tập dữ liệu nuScenes.
                    </p>
                </div>

                <div className='cvat-cuboid-qc-header-actions'>
                    {qcSummary && (
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleReset}
                        >
                            Phân tích tập dữ liệu mới
                        </Button>
                    )}
                </div>
            </div>

            {/* Upload & Configuration Card */}
            <QCUploadCard
                analyzing={analyzing}
                onStartAnalysis={handleStartAnalysis}
                onAnalysisComplete={handleAnalysisComplete}
            />

            {/* Results Section (Summary Cards & Scenes Table) */}
            {qcSummary && (
                <>
                    <QCSummaryCards
                        summary={qcSummary}
                        activeErrorFilter={activeErrorFilter}
                        onFilterChange={(filter) => setActiveErrorFilter(filter)}
                        onReset={handleReset}
                    />

                    <QCScenesTable
                        scenes={qcSummary.scenes}
                        activeErrorFilter={activeErrorFilter}
                        onOpenSceneModal={handleOpenSceneModal}
                    />
                </>
            )}

            {/* Detail Modal for Selected Scene */}
            <QCSceneDetailModal
                scene={selectedScene}
                visible={modalVisible}
                onClose={handleCloseModal}
            />
        </div>
    );
}

export default React.memo(CuboidQCPage);
