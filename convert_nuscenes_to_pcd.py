"""Convert nuScenes LiDAR (.pcd.bin / .bin) to standard binary PCD v0.7 for CVAT."""

from __future__ import annotations

import argparse
from pathlib import Path
import numpy as np


def write_binary_pcd(
    output_path: Path,
    xyz: np.ndarray,
    intensity: np.ndarray | None = None,
) -> int:
    """Write point cloud to standard binary PCD v0.7 with (x, y, z, intensity)."""
    point_count = len(xyz)
    if intensity is None:
        intensity = np.zeros(point_count, dtype=np.float32)

    xyz = np.asarray(xyz, dtype="<f4").reshape(-1, 3)
    intensity = np.asarray(intensity, dtype="<f4").reshape(-1, 1)
    xyzi = np.hstack([xyz, intensity])

    header = (
        "# .PCD v0.7 - Point Cloud Data file format\n"
        "VERSION 0.7\n"
        "FIELDS x y z intensity\n"
        "SIZE 4 4 4 4\n"
        "TYPE F F F F\n"
        "COUNT 1 1 1 1\n"
        f"WIDTH {point_count}\n"
        "HEIGHT 1\n"
        "VIEWPOINT 0 0 0 1 0 0 0\n"
        f"POINTS {point_count}\n"
        "DATA binary\n"
    ).encode("ascii")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("wb") as stream:
        stream.write(header)
        stream.write(xyzi.tobytes(order="C"))

    return point_count


def convert_nuscenes_bin_to_pcd(
    bin_path: Path,
    output_pcd_path: Path,
) -> int:
    """Read a nuScenes 5-channel float32 .bin/.pcd.bin file and write binary PCD."""
    raw = np.fromfile(bin_path, dtype=np.float32)
    
    if raw.size % 5 == 0 and raw.size % 4 != 0:
        channels = 5
    elif raw.size % 4 == 0 and raw.size % 5 != 0:
        channels = 4
    elif raw.size % 20 == 0:  # divisible by both 4 and 5
        channels = 5  # default nuScenes assumption
    else:
        raise ValueError(
            f"{bin_path}: raw float32 size ({raw.size}) is not divisible by 5 or 4"
        )

    scan = raw.reshape(-1, channels)
    xyz = scan[:, :3]
    intensity = scan[:, 3]

    return write_binary_pcd(output_pcd_path, xyz=xyz, intensity=intensity)


def batch_convert(
    input_dir: Path,
    output_dir: Path,
    sequential_names: bool = False,
) -> list[tuple[Path, Path, int]]:
    """Convert all .bin / .pcd.bin files in input_dir to .pcd files in output_dir."""
    output_dir.mkdir(parents=True, exist_ok=True)
    bin_files = sorted(
        list(input_dir.glob("*.pcd.bin")) or list(input_dir.glob("*.bin"))
    )
    if not bin_files:
        return []

    results = []
    for idx, bin_file in enumerate(bin_files):
        if sequential_names:
            out_file = output_dir / f"{idx:06d}.pcd"
        else:
            stem = bin_file.name.replace(".pcd.bin", "").replace(".bin", "")
            out_file = output_dir / f"{stem}.pcd"

        point_count = convert_nuscenes_bin_to_pcd(bin_file, out_file)
        results.append((bin_file, out_file, point_count))

    return results


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert nuScenes LiDAR (.pcd.bin) to standard binary PCD v0.7 for CVAT"
    )
    parser.add_argument(
        "--input",
        "-i",
        required=True,
        type=str,
        help="Path to .bin file or directory of .bin files",
    )
    parser.add_argument(
        "--output",
        "-o",
        required=True,
        type=str,
        help="Output directory or output file path",
    )
    parser.add_argument(
        "--sequential-names",
        action="store_true",
        help="Rename frames sequentially: 000000.pcd, 000001.pcd,...",
    )

    args = parser.parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)

    if input_path.is_file():
        if output_path.suffix.lower() == ".pcd":
            out_file = output_path
        else:
            output_path.mkdir(parents=True, exist_ok=True)
            out_file = output_path / f"{input_path.stem}.pcd"
        count = convert_nuscenes_bin_to_pcd(input_path, out_file)
        print(f"Converted {input_path.name} -> {out_file} ({count:,} points)")
    else:
        results = batch_convert(
            input_dir=input_path,
            output_dir=output_path,
            sequential_names=args.sequential_names,
        )
        print(f"Converted {len(results)} files to {output_path}")
        for src, dst, count in results[:5]:
            print(f"  {src.name} -> {dst.name} ({count:,} points)")
        if len(results) > 5:
            print(f"  ... and {len(results) - 5} more files.")


if __name__ == "__main__":
    main()
