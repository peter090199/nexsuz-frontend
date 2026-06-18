// import { Injectable } from '@angular/core';

// @Injectable({ providedIn: 'root' })
// export class FeatureService {

//   private map: any = {};

//   set(features: any[]) {
//     this.map = {};
//     features.forEach(f => {
//       this.map[f.feature_code] = f.feature_value;
//     });
//   }

//   get(code: string) {
//     return this.map[code];
//   }

//   can(code: string): boolean {
//     return this.map[code] === 'YES'; //feature value is 'YES' for enabled features
//   }

//   limit(code: string): number {
//     return Number(this.map[code] || 0);
//   }

//   isRestricted(code: string): boolean {
//     return ['LIMITED', 'RESTRICTED'].includes(this.map[code]);
//   }
// }

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {

  private featureMap: { [key: string]: any } = {};

  set(features: any[]): void {
    this.featureMap = {};
    features.forEach(feature => {
      this.featureMap[feature.feature_code] =
        feature.feature_value;
    });
  }

  can(featureCode: string): boolean {
    return (
      this.featureMap[featureCode] === 'YES'
    );
  }

  getValue(featureCode: string): any {
    return this.featureMap[featureCode];
  }

  has(featureCode: string): boolean {
    return !!this.featureMap[featureCode];
  }

  
  limit(code: string): number {
    return Number(this.featureMap[code] || 0);
  }

  isRestricted(code: string): boolean {
    return ['LIMITED', 'RESTRICTED'].includes(this.featureMap[code]);
  }
}