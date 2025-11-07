import torch

from color2gray.core import BT601, rgb_to_gray_tensor


def test_rgb_to_gray_single_pixel_red():
    red = torch.tensor([[1.0], [0.0], [0.0]])  # [3, 1]
    red = red.view(3, 1, 1)
    expected = torch.tensor(0.299)
    gray = rgb_to_gray_tensor(red, weights=BT601)
    assert torch.allclose(gray.squeeze(), expected, atol=1e-6)


def test_rgb_to_gray_batch_and_single_shapes():
    single = torch.rand(3, 8, 8)
    gray_single = rgb_to_gray_tensor(single)
    assert gray_single.shape == (1, 8, 8)

    batch = torch.rand(4, 3, 8, 8)
    gray_batch = rgb_to_gray_tensor(batch)
    assert gray_batch.shape == (4, 1, 8, 8)

