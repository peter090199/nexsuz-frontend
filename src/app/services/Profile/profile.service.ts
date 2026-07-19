import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { _url } from 'src/global-variables';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) { }

  private getAuthToken(): string {
    return sessionStorage.getItem('token') || ''; // Fetch the token from localStorage or other storage
  }

  private createHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private createParams(): HttpParams {
    return new HttpParams().set('desc_code', 'top_navigation');
  }

  getProfileByUserxx(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}profile/`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }


getProfileByUser(code:any): Observable<any> {
  const headers = this.createHeaders();
  return this.http.get(`${_url}profile/${code}`, { headers }).pipe(
    catchError(error => this.handleAuthError(error))
  );
}

getCompanyProfile(code: any): Observable<any> {
  const headers = this.createHeaders();
  return this.http.get(`${_url}company/profile/${code}`, { headers }).pipe(
    catchError(error => this.handleAuthError(error))
  );
}


 uploadCoverPhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('coverphoto', file);

    const headers = this.createHeaders();
    return this.http.post<any>(`${_url}uploadCoverPhoto`, formData, { headers });
  }

  getDataPost(code:any): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}post/${code}`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }


  getProfileByUserOnly(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}user/profile`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

    getProfileByBasicInfo(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}getProfileData`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }
  
  //follow users
  AddFollow(code: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http.put<any>(`${_url}follow/${code}`, {}, { headers });
  }



  Unfollow(id: number): Observable<any> {
    const headers = this.createHeaders();
    return this.http.delete<any>(`${_url}unfollow/${id}`, { headers });
  }


   getFollowStatus(code:any): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}follow/${code}`, { headers }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }


  getProfileByEmail(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}user/profile`, { headers }).pipe(
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

  getData(): Observable<any> {
    const headers = this.createHeaders();
    const params = this.createParams();
    return this.http.get(`${_url}accessmenu`, { headers, params });
  }


  getSecurityRolesByDesc_Code(rolecode: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${_url}security/${rolecode}`, { headers });
  }

  postData(endpoint: string, body: any): Observable<any> {
    const headers = this.createHeaders();
    return this.http.post(`${_url}${endpoint}`, body, { headers });
  }

  putData(endpoint: string, body: any): Observable<any> {
    const headers = this.createHeaders();
    return this.http.put(`${_url}${endpoint}`, body, { headers });
  }

  deleteData(endpoint: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http.delete(`${_url}${endpoint}`, { headers });
  }

  submitData(formData: any): Observable<any> {
    const headers = this.createHeaders();
    return this.http.post(`${_url}security`,formData, { headers });
  }

}
