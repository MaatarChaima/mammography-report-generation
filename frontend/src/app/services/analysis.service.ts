import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

// Réponse brute du notebook Flask /predict
export interface PredictResponse {
  classification: string;   // 'Malin' | 'Bénin'
  probability:    number;   // 0-100
  birads:         string;   // '2' | '3' | '4' | '5'
  report:         string;   // rapport complet MedGemma
  findings:       string;   // section Findings uniquement
  overlay_b64:    string;   // image PNG base64
  crop_b64:       string;   // crop PNG base64
  error?:         string;
}

// Interface interne utilisée par les composants
export interface AnalysisResult {
  rapport:        string;
  birads:         string;
  classification: string;
  probability:    number;
  nodule_detecte: boolean;
  image_annotee:  string | null;
  crop_b64:       string | null;
  findings:       string;
  error?:         string;
}

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  predict(imageFile: File): Observable<AnalysisResult> {
    const form = new FormData();
    form.append('image', imageFile);
    return this.http.post<PredictResponse>(`${this.apiUrl}/predict`, form).pipe(
      map(r => ({
        rapport:        r.report,
        birads:         r.birads,
        classification: r.classification,
        probability:    r.probability,
        nodule_detecte: r.classification === 'Malin',
        image_annotee:  r.overlay_b64 ? 'data:image/png;base64,' + r.overlay_b64 : null,
        crop_b64:       r.crop_b64    ? 'data:image/png;base64,' + r.crop_b64    : null,
        findings:       r.findings,
        error:          r.error,
      }))
    );
  }
}
