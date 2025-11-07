from pathlib import Path

from PIL import Image

from color2gray.cli import main


def test_cli_creates_grayscale_image(tmp_path: Path):
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "output.png"

    # Create simple 2x2 RGB image
    img = Image.new("RGB", (2, 2), color=(255, 0, 0))
    img.save(input_path)

    exit_code = main([str(input_path), str(output_path)])
    assert exit_code == 0

    result = Image.open(output_path)
    assert result.mode == "L"
    assert result.size == (2, 2)

