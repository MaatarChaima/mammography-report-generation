import { Component } from '@angular/core';
import { AnalysisResult } from './services/analysis.service';

export interface DiagnosisRecord {
  id: string;
  date: Date;
  modality: string;
  result: AnalysisResult;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  history: DiagnosisRecord[] = [];
  latestResult: AnalysisResult | null = null;
  modalRecord: DiagnosisRecord | null = null;

  // Pagination
  page = 1;
  pageSize = 5;

  get pagedHistory(): DiagnosisRecord[] {
    const start = (this.page - 1) * this.pageSize;
    return this.history.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.history.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onResult(r: AnalysisResult): void {
    this.latestResult = r;
    const record: DiagnosisRecord = {
      id: '#PX-' + String(Math.floor(10000 + Math.random() * 90000)),
      date: new Date(),
      modality: 'Mammographie',
      result: r,
    };
    this.history.unshift(record);
    this.page = 1;
  }

  openModal(record: DiagnosisRecord): void {
    this.modalRecord = record;
  }

  closeModal(): void {
    this.modalRecord = null;
  }

  downloadPdf(): void {
    window.print();
  }

  formatDate(d: Date): string {
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }) + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  resultClass(r: AnalysisResult): string {
    return r.nodule_detecte ? 'badge-malin' : 'badge-benin';
  }

  resultLabel(r: AnalysisResult): string {
    return r.nodule_detecte ? 'Malin' : 'Bénin';
  }

  biradsBadgeClass(birads: string): string {
    const n = parseInt(birads || '0', 10);
    if (n >= 5) return 'birads-high';
    if (n >= 4) return 'birads-medium';
    if (n >= 3) return 'birads-low';
    return 'birads-normal';
  }

  rapportBlocks(rapport: string): Array<{ type: 'heading' | 'para'; text: string }> {
    if (!rapport) return [];
    return rapport
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(l => {
        if (/^(Breast Composition|BIRADS|Findings)\s*:/i.test(l)) {
          return { type: 'heading' as const, text: l };
        }
        return { type: 'para' as const, text: l };
      });
  }
}
