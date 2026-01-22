from abc import ABC, abstractmethod
import os

class DataSource(ABC):
    @abstractmethod
    def get_text(self) -> str:
        """Retrieves text content from the source."""
        pass

class FileDataSource(DataSource):
    def __init__(self, file_path: str):
        self.file_path = file_path

    def get_text(self) -> str:
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"File not found: {self.file_path}")
        
        if self.file_path.lower().endswith('.pdf'):
            try:
                from pypdf import PdfReader
                reader = PdfReader(self.file_path)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
            except ImportError:
                raise ImportError("pypdf is required to read PDF files. Please install it.")
        
        with open(self.file_path, 'r', encoding='utf-8') as f:
            return f.read()

# Placeholder for future Database implementation
class DatabaseDataSource(DataSource):
    def __init__(self, connection_string: str):
        self.connection_string = connection_string

    def get_text(self) -> str:
        # TODO: Implement database retrieval logic
        raise NotImplementedError("Database source not yet implemented")
