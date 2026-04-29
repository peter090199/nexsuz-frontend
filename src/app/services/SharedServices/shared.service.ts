import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { _url } from 'src/global-variables';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  constructor(private http: HttpClient) { }

  private getAuthToken(): string {
    return sessionStorage.getItem('token') || ''; // Fetch the token from localStorage or other storage
  }


  private createHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      //'Content-Type': 'application/json'
    });
  }



  private createParams(): HttpParams {
    return new HttpParams().set('desc_code', 'top_navigation');
  }

  getProfileByUser(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}profile`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  private handleAuthError(error: any): Observable<any> {
    if (error.status === 401) {
      console.error('Unauthorized: Please log in.');
      alert('Unauthorized access. Please log in again.');
    } else if (error.status === 403) {
      console.error('Forbidden: You do not have permission to access this resource.');
      alert('Forbidden: You do not have the required permissions.');
    } else {
      console.error('An error occurred:', error.message);
      alert('An unexpected error occurred. Please try again.');
    }
    return of(null); // Return an observable with a fallback value
  }

  getSettingsUrl(profile: any): string {
    if (!profile) return '/profile';

    switch (profile.role_code) {
      case 'DEF-CLIENT':
        return `/recruiter/settings`;
      case 'DEF-MASTERADMIN':
        return `/masteradmin/settings`;
      case 'DEF-ADMIN':
        return `/admin/settings`;
      default:
        return `/profile/settings`;
    }
  }

  getProfileUrl(profile: any): string {
    if (!profile) return '/recruiter/profile';

    const code = profile.code || ''; // adjust based on your API

    switch (profile.role_code) {
      case 'DEF-CLIENT':
        return `/recruiter/client_profile/${code}`;
      case 'DEF-MASTER-ADMIN':
        return `/masteradmin/profile/${code}`;
      case 'DEF-ADMIN':
        return `/admin/profile/${code}`;
      default:
        return `/recruiter/profile/${code}`;
    }
  }

  getProfileUrlBycode(code: any): string {
    if (!code) return '/profile';
    switch (code) {
      case 'DEF-USERS':
        return `/recruiter/profile/${code}`;
      case 'DEF-MASTER-ADMIN':
        return `/masteradmin/profile/${code}`;
      case 'DEF-ADMIN':
        return `/admin/profile/${code}`;
      default:
        return `/profile/${code}`;
    }
  }


  cleanImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    let cleanPath = path.replace('/storage/app/public/', '/storage/');
    cleanPath = cleanPath.replace(/^\/+/, ''); // remove leading slash
    return `https://api.nexsuz.com/${cleanPath}`;
  }


  getApplicationScore(transNo: string): Observable<any> {
     const headers = this.createHeaders();
    return this.http.get(`${_url}getApplicationScore/${transNo}`, { headers });
  }

}
