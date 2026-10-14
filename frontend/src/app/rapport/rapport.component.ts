import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AnalysisResult } from '../services/analysis.service';

@Component({
  selector: 'app-rapport',
  templateUrl: './rapport.component.html',
  styleUrls: ['./rapport.component.scss']
})
export class RapportComponent {
  @Input() result!: AnalysisResult;
  @Output() newAnalysis = new EventEmitter<void>();

  get statusClass(): string {
    return this.result.nodule_detecte ? 'status-alert' : 'status-normal';
  }

  get statusIcon(): string {
    return this.result.nodule_detecte ? '⚠️' : '✅';
  }

  get statusLabel(): string {
    return this.result.nodule_detecte ? 'Lésion maligne détectée' : 'Lésion bénigne';
  }

  get probabilityLabel(): string {
    return `${this.result.probability.toFixed(1)}% malignité`;
  }

  get biradsBadgeClass(): string {
    const n = parseInt(this.result.birads || '0', 10);
    if (n >= 5) return 'birads-high';
    if (n >= 4) return 'birads-medium';
    if (n >= 3) return 'birads-low';
    return 'birads-normal';
  }

  // Découpe le rapport MedGemma en blocs affichables
  rapportBlocks(): Array<{ type: 'heading' | 'para'; text: string }> {
    if (!this.result.rapport) return [];
    return this.result.rapport
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(l => {
        // Lignes de section : "Breast Composition:", "BIRADS:", "Findings:"
        if (/^(Breast Composition|BIRADS|Findings)\s*:/i.test(l)) {
          return { type: 'heading' as const, text: l };
        }
        return { type: 'para' as const, text: l };
      });
  }
}
