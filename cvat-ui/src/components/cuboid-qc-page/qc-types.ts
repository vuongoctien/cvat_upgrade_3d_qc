// Copyright (C) 2026 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

export enum QCErrorType {
    FEW_LIDAR_POINTS = 'few_lidar_points',
    IRRATIONAL_SIZE = 'irrational_size',
    OVERLAPPING_CUBOIDS = 'overlapping_cuboids',
    OPPOSITE_HEADING = 'opposite_heading',
}

export interface QCErrorMeta {
    type: QCErrorType;
    labelVi: string;
    labelEn: string;
    color: string;
    badgeColor: string;
    description: string;
}

export const QC_ERROR_METADATA: Record<QCErrorType, QCErrorMeta> = {
    [QCErrorType.FEW_LIDAR_POINTS]: {
        type: QCErrorType.FEW_LIDAR_POINTS,
        labelVi: 'Quá ít điểm LiDAR',
        labelEn: 'Low LiDAR Point Density',
        color: '#fa8c16',
        badgeColor: 'warning',
        description: 'Số lượng điểm phản xạ LiDAR bên trong bounding box nhỏ hơn ngưỡng cho phép',
    },
    [QCErrorType.IRRATIONAL_SIZE]: {
        type: QCErrorType.IRRATIONAL_SIZE,
        labelVi: 'Kích thước phi lý theo class',
        labelEn: 'Dimension Anomaly',
        color: '#f5222d',
        badgeColor: 'error',
        description: 'Kích thước (dài x rộng x cao) vượt quá biên độ kích thước chuẩn của nhãn đối tượng',
    },
    [QCErrorType.OVERLAPPING_CUBOIDS]: {
        type: QCErrorType.OVERLAPPING_CUBOIDS,
        labelVi: 'Cuboid chồng nhau',
        labelEn: 'Overlapping Cuboids',
        color: '#722ed1',
        badgeColor: 'purple',
        description: 'Chỉ số giao nhau không gian 3D (IoU) giữa 2 bounding box vượt ngưỡng va chạm',
    },
    [QCErrorType.OPPOSITE_HEADING]: {
        type: QCErrorType.OPPOSITE_HEADING,
        labelVi: 'Hướng ngược chiều di chuyển',
        labelEn: 'Opposite Heading to Motion',
        color: '#13c2c2',
        badgeColor: 'cyan',
        description: 'Vector hướng mũi xe (yaw angle) ngược chiều (>90°) so với vector vận tốc di chuyển',
    },
};

export interface CuboidDimensions {
    length: number;
    width: number;
    height: number;
}

export interface SuspectedCuboid {
    id: string;
    trackId: string;
    frame: number;
    timestamp: string;
    label: string;
    errorType: QCErrorType;
    severity: 'critical' | 'warning' | 'info';
    reason: string;
    metrics: {
        pointCount?: number;
        minPointThreshold?: number;
        dimensions?: CuboidDimensions;
        expectedDimensionsRange?: string;
        overlapIou?: number;
        conflictingTrackId?: string;
        yawAngleDeg?: number;
        motionVectorDeg?: number;
        angleDeltaDeg?: number;
    };
    cvatUrl: string;
    status: 'pending' | 'verified_bug' | 'false_positive';
}

export interface SceneQCResult {
    id: string;
    token: string;
    sceneName: string;
    location: string;
    description: string;
    taskId: number;
    jobId: number;
    frameCount: number;
    totalCuboids: number;
    errorCounts: {
        [QCErrorType.FEW_LIDAR_POINTS]: number;
        [QCErrorType.IRRATIONAL_SIZE]: number;
        [QCErrorType.OVERLAPPING_CUBOIDS]: number;
        [QCErrorType.OPPOSITE_HEADING]: number;
        total: number;
    };
    riskLevel: 'high' | 'medium' | 'low' | 'clean';
    suspectedCuboids: SuspectedCuboid[];
}

export interface QCSessionSummary {
    datasetName: string;
    fileSizeMb: number;
    uploadedAt: string;
    backendTaskStatus: string;
    cvatTaskId: number;
    cvatTaskName: string;
    totalScenes: number;
    totalFrames: number;
    totalCuboids: number;
    totalIssues: number;
    errorCounts: {
        [QCErrorType.FEW_LIDAR_POINTS]: number;
        [QCErrorType.IRRATIONAL_SIZE]: number;
        [QCErrorType.OVERLAPPING_CUBOIDS]: number;
        [QCErrorType.OPPOSITE_HEADING]: number;
    };
    scenes: SceneQCResult[];
}

export interface QCAnalysisConfig {
    taskName: string;
    backendApiUrl: string;
    minPointsThreshold: number;
    overlapIouThreshold: number;
    dimensionTolerancePercent: number;
    headingToleranceAngle: number;
    createCvatTask: boolean;
}
