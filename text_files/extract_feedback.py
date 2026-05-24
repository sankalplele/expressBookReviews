from pathlib import Path
from PyPDF2 import PdfReader
p = Path('resultof assignmet.pdf')
reader = PdfReader(str(p))
for i, page in enumerate(reader.pages, start=1):
    print(f'--- PAGE {i} ---')
    print(page.extract_text())
    print()