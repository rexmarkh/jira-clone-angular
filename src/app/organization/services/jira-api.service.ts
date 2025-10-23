import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { JiraBoard } from '../interfaces/organization.interface';

@Injectable({
  providedIn: 'root'
})
export class JiraApiService {
  private readonly baseUrl = 'https://68f7adcd0002bcc324ff.fra.appwrite.run';

  constructor(private http: HttpClient) {}

  /**
   * Fetch boards for a specific organization from the backend
   */
  getBoardsByOrganization(orgId: string): Observable<JiraBoard[]> {
    const url = `${this.baseUrl}/boards?orgId=${orgId}`;
    
    return this.http.get<JiraBoard[]>(url).pipe(
      map(response => {
        // Ensure the response is always an array
        return Array.isArray(response) ? response : [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get board details by board ID
   */
  getBoardDetails(boardId: string, orgId: string): Observable<JiraBoard> {
    const url = `${this.baseUrl}/boards/${boardId}?orgId=${orgId}`;
    
    return this.http.get<JiraBoard>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: Invalid organization ID or missing parameters';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please check your Jira integration';
          break;
        case 403:
          errorMessage = 'Forbidden: Access denied to Jira boards';
          break;
        case 404:
          errorMessage = 'Not Found: No boards found for this organization';
          break;
        case 500:
          errorMessage = 'Server Error: Unable to fetch boards at this time';
          break;
        default:
          errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('JiraApiService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}