import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { _url } from 'src/global-variables';

@Injectable({
  providedIn: 'root'
})
export class UserPlanService {

  constructor(private http: HttpClient) { }

  private getAuthToken(): string {
    return sessionStorage.getItem('token') || '';
  }

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.getAuthToken()}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * CREATE
   */
  save(data: any): Observable<any> {
    return this.http.post(
      `${_url}account-plan/save`,
      data,
      { headers: this.createHeaders() }
    );
  }

  /**
   * READ ALL
   */
  getAll(): Observable<any> {
    return this.http.get(
      `${_url}account-plan/list`,
      { headers: this.createHeaders() }
    );
  }

  /**
   * READ SINGLE
   */
  getById(planId: string): Observable<any> {
    return this.http.get(
      `${_url}account-plan/show/${planId}`,
      { headers: this.createHeaders() }
    );
  }

  /**
   * UPDATE
   */
  update(planId: string, data: any): Observable<any> {
    return this.http.put(
      `${_url}account-plan/update/${planId}`,
      data,
      { headers: this.createHeaders() }
    );
  }

  /**
   * DELETE
   */
  delete(id: number): Observable<any> {
    return this.http.delete(
      `${_url}account-plan/delete/${id}`,
      { headers: this.createHeaders() }
    );
  }

  /**
   * DEACTIVATE
   */
  deactivate(id: number): Observable<any> {
    return this.http.patch(
      `${_url}account-plan/deactivate/${id}`,
      {},
      { headers: this.createHeaders() }
    );
  }



  // Feature APIs
  saveFeature(data: any) {
    return this.http.post(
      `${_url}account-plan-details/save`,
      data,
      { headers: this.createHeaders() }
    );
  }

  getFeatures(planId: string) {
    return this.http.get(
      `${_url}account-plan-details/getByPlan/${planId}`,
      { headers: this.createHeaders() }
    );
  }

  updateFeature(id: number, data: any) {
    return this.http.put(
      `${_url}account-plan-details/update/${id}`,
      data,
      { headers: this.createHeaders() }
    );
  }

  deleteFeature(id: number) {
    return this.http.delete(
      `${_url}account-plan-details/delete/${id}`,
      { headers: this.createHeaders() }
    );
  }

  //upgradeplan
  upgradePlan(data: any) {
    return this.http.post(
      `${_url}account-plan/upgrade`,
      data,
      {
        headers: this.createHeaders()
      }
    );
  }

  activateFreePlan() {
    return this.http.post(
      `${_url}account-plan/free-plan`,
      {},
      {
        headers: this.createHeaders()
      }
    );
  }

}