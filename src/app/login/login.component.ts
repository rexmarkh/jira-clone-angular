import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from '../project/auth/auth.service';
import { AuthQuery } from '../project/auth/auth.query';
import { Client, Account, OAuthProvider } from "appwrite";
import { environment } from '../../environments/environment';
@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private authQuery: AuthQuery
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    
    // Check if user is already authenticated
    this.authQuery.user$.pipe(untilDestroyed(this)).subscribe(user => {
      if (user && user.id) {
        // User is already logged in, redirect to board
        this.router.navigate(['/project/board']);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;

      try {
        const { email, password } = this.loginForm.value;
        
        // Call the auth service to login with the form data
        this.authService.login({ email, password });
        
        // Wait for authentication to complete
        await new Promise(resolve => {
          this.authQuery.user$.pipe(untilDestroyed(this)).subscribe(user => {
            if (user && user.id) {
              resolve(user);
            }
          });
        });
        
        // On successful login, redirect to board
        this.router.navigate(['/project/board']);
        
      } catch (error: any) {
        this.error = error.message || 'Login failed. Please try again.';
        console.error('Login error:', error);
      } finally {
        this.loading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  async onGoogleSignIn(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // // For demo purposes, use a Google OAuth email
      // const googleEmail = 'user@gmail.com';
      
      // // Call the auth service with Google email
      // this.authService.login({ email: googleEmail, password: 'oauth' });
      
      // // Wait for authentication to complete
      // await new Promise(resolve => {
      //   this.authQuery.user$.pipe(untilDestroyed(this)).subscribe(user => {
      //     if (user && user.id) {
      //       resolve(user);
      //     }
      //   });
      // });
      
      // // On successful login, redirect to board
      // this.router.navigate(['/project/board']);

      const client = new Client()
            .setEndpoint(environment.appwriteEndpoint)
            .setProject(environment.appwriteProjectId);                // Your project ID

    const account = new Account(client);

    // Go to OAuth provider login page
    account.createOAuth2Session({
        provider: OAuthProvider.Google,
        success: 'https://retrofy.in/project/retrospective', // redirect here on success
        failure: 'https://retrofy.in/login', // redirect here on failure
        //scopes: ['repo', 'user'] // scopes (optional)
    });
      
    } catch (error: any) {
      this.error = error.message || 'Google Sign-In failed. Please try again.';
      console.error('Google Sign-In error:', error);
    } finally {
      this.loading = false;
    }
  }

  async onGitHubSignIn(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // For demo purposes, use a GitHub OAuth email
      const githubEmail = 'user@github.com';
      
      // Call the auth service with GitHub email
      this.authService.login({ email: githubEmail, password: 'oauth' });
      
      // Wait for authentication to complete
      await new Promise(resolve => {
        this.authQuery.user$.pipe(untilDestroyed(this)).subscribe(user => {
          if (user && user.id) {
            resolve(user);
          }
        });
      });
      
      // On successful login, redirect to board
      this.router.navigate(['/project/board']);
      
    } catch (error: any) {
      this.error = error.message || 'GitHub Sign-In failed. Please try again.';
      console.error('GitHub Sign-In error:', error);
    } finally {
      this.loading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onForgotPassword(): void {
    // TODO: Implement forgot password functionality
    console.log('Forgot password clicked');
  }

  onCreateAccount(): void {
    // TODO: Navigate to registration page or show registration form
    console.log('Create account clicked');
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Form validation getters
  get email() { 
    return this.loginForm.get('email'); 
  }

  get password() { 
    return this.loginForm.get('password'); 
  }

  get isEmailInvalid(): boolean {
    return !!(this.email?.invalid && (this.email?.dirty || this.email?.touched));
  }

  get isPasswordInvalid(): boolean {
    return !!(this.password?.invalid && (this.password?.dirty || this.password?.touched));
  }

  get emailErrorMessage(): string {
    if (this.email?.errors?.['required']) {
      return 'Email is required';
    }
    if (this.email?.errors?.['email']) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  get passwordErrorMessage(): string {
    if (this.password?.errors?.['required']) {
      return 'Password is required';
    }
    if (this.password?.errors?.['minlength']) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  }
}