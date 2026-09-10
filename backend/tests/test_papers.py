import io
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_get_papers_empty(monkeypatch):
    """Test getting papers when none exist (or just tests the endpoint runs)."""
    response = client.get("/api/v1/papers/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_upload_paper_success(monkeypatch):
    """Test successfully uploading a valid PDF document."""
    # Mock ChromaService to prevent actual vector DB indexing during test
    monkeypatch.setattr("backend.routers.papers.ChromaService", MagicMock())
    
    # Mock process_paper_background so we don't spawn real background tasks that fail
    monkeypatch.setattr("backend.routers.papers.process_paper_background", MagicMock())

    dummy_pdf = io.BytesIO(b"%PDF-1.4 dummy pdf content")
    response = client.post(
        "/api/v1/papers/upload",
        files={"file": ("test_paper.pdf", dummy_pdf, "application/pdf")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["title"] == "test_paper.pdf"
    assert data["is_indexed"] == 1

def test_upload_paper_rejected_bad_type():
    """Test that uploading a non-allowed file extension is rejected."""
    dummy_img = io.BytesIO(b"fake image data")
    response = client.post(
        "/api/v1/papers/upload",
        files={"file": ("image.jpg", dummy_img, "image/jpeg")}
    )
    
    assert response.status_code == 422
    assert "Unsupported file type" in response.json()["detail"]

@patch("backend.routers.papers.UploadFile.file")
def test_upload_paper_rejected_oversized(mock_file):
    """Test that uploading a file larger than 50MB is rejected."""
    # Mock the file to report a size of 60MB
    mock_file.tell.return_value = 60 * 1024 * 1024
    
    dummy_pdf = io.BytesIO(b"small content but mocks large size")
    
    # We must mock the specific instance of file created by FastAPI, which can be tricky.
    # An easier way is to just use patch on the underlying tell method of the spooled temp file.
    with patch("tempfile.SpooledTemporaryFile.tell", return_value=60 * 1024 * 1024):
        response = client.post(
            "/api/v1/papers/upload",
            files={"file": ("large_paper.pdf", dummy_pdf, "application/pdf")}
        )
        
    assert response.status_code == 413
    assert "File too large" in response.json()["detail"]
