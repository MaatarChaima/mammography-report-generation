import { Component, EventEmitter, Output } from '@angular/core';
import { AnalysisService, AnalysisResult } from '../services/analysis.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  @Output() resultReady = new EventEmitter<AnalysisResult>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading = false;
  errorMsg = '';

  constructor(private analysisService: AnalysisService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    this.errorMsg = '';
    const reader = new FileReader();
    reader.onload = () => { this.previewUrl = reader.result as string; };
    reader.readAsDataURL(this.selectedFile);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedFile = file;
      this.errorMsg = '';
      const reader = new FileReader();
      reader.onload = () => { this.previewUrl = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  analyze(): void {
    if (!this.selectedFile) return;
    this.loading = true;
    this.errorMsg = '';
    this.analysisService.predict(this.selectedFile).subscribe({
      next: (result) => {
        this.loading = false;
        this.resultReady.emit(result);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.error || 'Connection error — is the Flask server running?';
      }
    });
  }

  reset(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.errorMsg = '';
  }
}
